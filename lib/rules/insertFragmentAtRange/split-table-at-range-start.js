// @flow
import isSameWidth from './utils/isSameWidth';
import type Options from '../../options';
import { type typeRule } from './type';

function splitTableAtRangeStart(opts: Options): typeRule {
    return (rootInsert, change, range, fragment, insertOptions, next) => {
        if (fragment.nodes.size < 2) {
            return next(insertOptions);
        }
        const lastNode = fragment.nodes.last();

        if (lastNode.type !== opts.typeTable) {
            return next(insertOptions);
        }

        const ancestors = insertOptions.startAncestors;
        const cellAncestorIndex = ancestors.findLastIndex(
            n => n.object === 'block'
        );
        const cell = ancestors.get(cellAncestorIndex);

        if (!cell || cell.type !== opts.typeCell) {
            return next(insertOptions);
        }

        const table = ancestors.get(cellAncestorIndex - 2);
        const row = ancestors.get(cellAncestorIndex - 1);

        if (row === table.nodes.last()) {
            return next(opts);
        }

        if (!isSameWidth(table, lastNode)) {
            return next(opts);
        }

        const takeIndex = table.nodes.indexOf(row);
        const prevTable = table.set('nodes', table.nodes.take(takeIndex + 1));
        const nextTable = table.set('nodes', table.nodes.skip(takeIndex + 1));
        const tableParent = ancestors.findLast(
            (n, index) => ancestors.get(index + 1) === table
        );
        const insertIndex = tableParent.nodes.indexOf(table);
        change.insertNodeByKey(tableParent.key, insertIndex, prevTable, {
            normalize: false
        });
        change.replaceNodeByKey(table.key, nextTable.key, { normalize: false });
        return rootInsert(change, range, fragment, insertOptions);
    };
}
export default splitTableAtRangeStart;
