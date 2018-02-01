// @flow
import { type Node } from 'slate';
import type Options from '../../options';
import { type typeRule } from './type';

function connectable(row: Node, fragmentTable: Node): boolean {
    const rowSize = row.nodes.size;
    if (fragmentTable.nodes.first().size <= rowSize) {
        const invalid = fragmentTable.nodes
            .shift()
            .find(n => n.nodes.size !== rowSize);
        return !invalid;
    }
    return false;
}

function appendTableAtRangeStart(opts: Options): typeRule {
    return (rootInsert, change, range, fragment, insertOptions, next) => {
        const { startKey } = range;

        if (fragment.nodes.size === 0) {
            return next(insertOptions);
        }
        const firstNode = fragment.nodes.first();

        if (firstNode.type !== opts.typeTable) {
            return next(insertOptions);
        }

        const { document } = change.value;
        const ancestors = document.getAncestors(startKey);
        const cell = ancestors.findLast(n => n.object === 'block');

        if (!cell || cell.type !== opts.typeCell) {
            return next(insertOptions);
        }

        const table = ancestors.findLast(n => n.type === opts.typeTable);
        const row = table.getParent(cell);
        if (row !== table.nodes.last()) {
            // split node if necessary
            return next(opts);
        }

        if (!connectable(row, firstNode)) {
            if (range.getDescendant(range.endKey)) {
                return next(opts);
            }
            const nextBlock = document.getNextBlock(table.key);
            if (!nextBlock) {
                return next(opts);
            }
            range = range.moveAnchorToStartOf(nextBlock);
            return rootInsert(change, range, fragment, insertOptions);
        }

        const firstRow = firstNode.nodes.first();
        row.nodes.findLast((afterCell, index) => {
            const pasteCell = firstRow.nodes.get(
                firstRow.nodes.size - row.nodes.size + index
            );
            pasteCell.nodes.forEach((textNode, textIndex) => {
                change.insertNodeByKey(
                    afterCell.key,
                    afterCell.nodes.size + textIndex,
                    textNode,
                    { normalize: false }
                );
            });
            return afterCell === cell;
        });

        firstNode.nodes.shift().forEach((n, index) => {
            change.insertNodeByKey(table.key, index + table.nodes.size, n, {
                normalize: false
            });
        });

        fragment = fragment.set('nodes', fragment.nodes.shift());
        const nextBlock = document.getNextBlock(table.key);
        if (!nextBlock) {
            range = range.moveAnchorToEndOf(firstNode);
        } else {
            range = range.moveAnchorToStartOf(nextBlock);
        }
        return rootInsert(change, range, fragment, insertOptions);
    };
}
export default appendTableAtRangeStart;
