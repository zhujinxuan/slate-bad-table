// @flow
import type Options from '../../options';
import { type typeRule } from './type';

function ifEndInEditTable(opts: Options): typeRule {
    return (rootDelete, change, range, removeOptions, next) => {
        const { document } = change.value;

        const ancestors = removeOptions.endAncestors;
        const cellAncestorIndex = ancestors.findLastIndex(
            n => n.object === 'block'
        );

        const cell = ancestors.get(cellAncestorIndex);
        if (!cell || cell.type !== opts.typeCell) {
            return next(removeOptions);
        }

        const table = ancestors.get(cellAncestorIndex - 2);
        const { startAncestors } = removeOptions;
        if (startAncestors.includes(table)) {
            return next(removeOptions);
        }

        const prevBlock = document.getPreviousBlock(table.key);
        if (prevBlock) {
            rootDelete(
                change,
                range.moveFocusToEndOf(prevBlock),
                removeOptions.set('deleteEndText', true)
            );
        }

        return rootDelete(
            change,
            range.moveAnchorToStartOf(table),
            removeOptions.set('deleteStartText', true)
        );
    };
}

export default ifEndInEditTable;
