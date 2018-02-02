// @flow
import type Options from '../../options';
import { type typeRule } from './type';

function ifStartInCell(opts: Options): typeRule {
    return (rootDelete, change, range, removeOptions, next) => {
        const { document } = change.value;
        const { startAncestors, endAncestors } = removeOptions;
        const cell = startAncestors.findLast(x => x.type === opts.typeBadCell);
        if (!cell) {
            return next(removeOptions);
        }
        if (endAncestors.includes(cell)) {
            return next(removeOptions);
        }
        const nextBlock = document.getNextBlock(cell.key);
        if (nextBlock) {
            rootDelete(
                change,
                range.moveAnchorToStartOf(nextBlock),
                removeOptions.set('deleteStartText', true)
            );
        }
        rootDelete(
            change,
            range.moveFocusToEndOf(cell),
            removeOptions.set('deleteEndText', true)
        );

        return change;
    };
}

export default ifStartInCell;
