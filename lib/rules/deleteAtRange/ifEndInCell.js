// @flow
import type Options from '../../options';
import { type typeRule } from './type';

function ifEndInCell(opts: Options): typeRule {
    return (rootDelete, change, range, removeOptions, next) => {
        const { startKey, endKey } = range;
        const { document } = change.value;
        const cell = document.getClosest(
            endKey,
            x => x.type === opts.typeBadCell
        );
        if (!cell) {
            return next(removeOptions);
        }
        if (cell.getDescendant(startKey)) {
            return next(removeOptions);
        }
        const prevBlock = document.getPreviousBlock(cell.key);
        if (prevBlock) {
            rootDelete(
                change,
                range.moveFocusToEndOf(prevBlock),
                removeOptions
            );
        }
        removeOptions.deleteStartText = true;
        return rootDelete(
            change,
            range.moveAnchorToStartOf(cell),
            removeOptions
        );
    };
}

export default ifEndInCell;
