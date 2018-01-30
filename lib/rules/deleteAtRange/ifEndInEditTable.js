// @flow
import type Options from '../../options';
import { type typeRule } from './type';

function ifEndInEditTable(opts: Options): typeRule {
    return (rootDelete, change, range, removeOptions, next) => {
        const { startKey, endKey } = range;
        const { document } = change.value;

        const ancestors = document.getAncestors(endKey);

        const cell = ancestors.findLast(n => n.type === opts.typeCell);
        if (!cell) {
            return next(removeOptions);
        }

        const table = ancestors.findLast(n => n.type === opts.typeTable);
        if (table.getDescendant(startKey)) {
            // A Naive speed up when in same table
            return next(removeOptions);
        }

        const prevText = document.getPreviousBlock(table.key);
        if (prevText) {
            rootDelete(change, range.moveFocusToEndOf(prevText), {
                ...removeOptions,
                deleteEndText: true
            });
        }

        return rootDelete(change, range.moveAnchorToStartOf(table), {
            ...removeOptions,
            deleteStartText: true
        });
    };
}

export default ifEndInEditTable;
