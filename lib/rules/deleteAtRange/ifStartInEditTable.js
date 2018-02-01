// @flow
import type Options from '../../options';
import { type typeRule } from './type';

function ifStartInEditCell(opts: Options): typeRule {
    return (rootDelete, change, range, removeOptions, next) => {
        const { startKey, endKey } = range;
        const { document } = change.value;

        const ancestors = document.getAncestors(startKey);

        const cell = ancestors.findLast(n => n.type === opts.typeCell);
        if (!cell) {
            return next(removeOptions);
        }

        const table = ancestors.findLast(n => n.type === opts.typeTable);
        if (table.getDescendant(endKey)) {
            // A Naive speed up when in same table
            return next(removeOptions);
        }

        rootDelete(
            change,
            range.moveFocusToEndOf(table),
            removeOptions.set('deleteEndText', true)
        );

        const nextText = document.getNextBlock(table.key);
        if (nextText) {
            rootDelete(
                change,
                range.moveAnchorToStartOf(nextText),
                removeOptions.set('deleteStartText', true)
            );
        }
        return change;
    };
}

export default ifStartInEditCell;
