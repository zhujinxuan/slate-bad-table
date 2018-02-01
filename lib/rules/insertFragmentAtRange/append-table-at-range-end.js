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
        const firstNode = fragment.nodes.last();

        if (firstNode.type !== opts.typeTable) {
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
        if (row !== table.nodes.first()) {
            // split node if necessary
            return next(opts);
        }

        if (!connectable(row, firstNode)) {
            if (range.getDescendant(range.startKey)) {
                return next(opts);
            }
            const prevBlock = document.getPreviousBlock(table.key);
            if (!prevBlock) {
                return next(opts);
            }
            range = range.moveFocusToEndOf(prevBlock);
            return rootInsert(change, range, fragment, insertOptions);
        }

        firstNode.nodes.pop().forEach((n, index) => {
            change.insertNodeByKey(table.key, index, n, {
                normalize: false
            });
        });

        const lastRow = firstNode.nodes.last();
        row.nodes.find((beforeCell, index) => {
            const pasteCell = lastRow.nodes.get(index);
            pasteCell.nodes.forEach((textNode, textIndex) => {
                change.insertNodeByKey(beforeCell.key, textIndex, textNode, {
                    normalize: false
                });
            });
            return beforeCell === cell;
        });

        fragment = fragment.set('nodes', fragment.nodes.pop());
        const prevBlock = document.getPreviousBlock(table.key);
        if (!prevBlock) {
            range = range.moveFocusToStartOf(firstNode);
        } else {
            range = range.moveFocusToEndOf(prevBlock);
        }
        return rootInsert(change, range, fragment, insertOptions);
    };
}
export default appendTableAtRangeEnd;
