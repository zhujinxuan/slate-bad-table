// @flow
import { type Node } from 'slate';
import type Options from '../../options';
import { type typeRule } from './type';

function connectable(row: Node, fragmentTable: Node): boolean {
    const rowSize = row.nodes.size;
    if (fragmentTable.nodes.last().size <= rowSize) {
        const invalid = fragmentTable.nodes
            .pop()
            .find(n => n.nodes.size !== rowSize);
        return !invalid;
    }
    return false;
}

function appendTableAtRangeEnd(opts: Options): typeRule {
    return (rootInsert, change, range, fragment, insertOptions, next) => {
        const { endKey } = range;

        if (fragment.nodes.size === 0) {
            return next(insertOptions);
        }
        const lastNode = fragment.nodes.last();

        if (lastNode.type !== opts.typeTable) {
            return next(insertOptions);
        }

        const { document } = change.value;
        const ancestors = document.getAncestors(endKey);
        const cell = ancestors.findLast(n => n.object === 'block');

        if (!cell || cell.type !== opts.typeCell) {
            return next(insertOptions);
        }

        const table = ancestors.findLast(n => n.type === opts.typeTable);
        const row = table.getParent(cell);
        if (row === table.nodes.first()) {
            return next(opts);
        }

        if (!connectable(row, lastNode)) {
            if (range.getDescendant(range.startKey)) {
                return next(opts);
            }
            const prevBlock = document.getPreviousBlock(table.key);
            if (!prevBlock) {
                return next(opts);
            }
            range = range.moveAnchorToEndOf(prevBlock);
            return rootInsert(change, range, fragment, insertOptions);
        }

        const takeIndex = table.nodes.indexOf(row);
        const prevTable = table.set('nodes', table.nodes.take(takeIndex));
        const nextTable = table.set('nodes', table.nodes.skip(takeIndex));
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
export default appendTableAtRangeEnd;
