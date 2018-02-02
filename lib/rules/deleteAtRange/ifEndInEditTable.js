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
        if (removeOptions.startAncestors.includes(table)) {
            // A Naive speed up when in same table
            return next(removeOptions);
        }

        const prevText = document.getPreviousBlock(table.key);
        if (prevText) {
            rootDelete(
                change,
                range.moveFocusToEndOf(prevText),
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
