// @flow
import isSameWidth from './utils/isSameWidth';
import type Options from '../../options';
import { type typeRule } from './type';

function splitTableAtRangeEnd(opts: Options): typeRule {
    return (rootInsert, change, range, fragment, insertOptions, next) => {
        if (fragment.nodes.size < 2) {
            return next(insertOptions);
        }
        const lastNode = fragment.nodes.last();

        if (lastNode.type !== opts.typeTable) {
            return next(insertOptions);
        }

        const ancestors = insertOptions.endAncestors;
        const cellAncestorIndex = ancestors.findLastIndex(
            n => n.object === 'block'
        );
        const cell = ancestors.get(cellAncestorIndex);

        if (!cell || cell.type !== opts.typeCell) {
            return next(insertOptions);
        }

        const table = ancestors.get(cellAncestorIndex - 2);
        const row = ancestors.get(cellAncestorIndex - 1);

        if (row === table.nodes.first()) {
            return next(insertOptions);
        }

        if (!isSameWidth(table, lastNode)) {
            return next(insertOptions);
        }

        const takeIndex = table.nodes.indexOf(row);
        const prevTable = table.set('nodes', table.nodes.take(takeIndex));
        const nextTable = table.set('nodes', table.nodes.skip(takeIndex));
        const tableParent = ancestors.get(cellAncestorIndex - 3);
        const insertIndex = tableParent.nodes.indexOf(table);
        change.insertNodeByKey(tableParent.key, insertIndex, prevTable, {
            normalize: false
        });
        change.replaceNodeByKey(table.key, nextTable.key, { normalize: false });
        return rootInsert(change, range, fragment, insertOptions);
    };
}
export default splitTableAtRangeEnd;
