// @flow
import { Block, Text } from 'slate';
import { type typeRule } from './type';
import type Options from '../../options';

function ifStartInCell(opts: Options): typeRule {
    return (rootGetFragment, node, range, next) => {
        const { startKey, endKey, endOffset } = range;
        const endAncestors = node.getAncestors(endKey);
        const cell = endAncestors.findLast(n => n.object === 'block');
        if (!cell || cell.type !== opts.typeCell) {
            return next();
        }
        if (cell.getDescendant(startKey)) {
            return next();
        }

        const table = endAncestors.findLast(n => n.type === opts.typeTable);

        const row = table.getParent(cell.key);
        if (cell === row.nodes.last()) {
            return next();
        }

        const cellIndex = row.nodes.indexOf(cell);

        const newRow = row.set(
            'nodes',
            row.nodes.map((afterCell, afterCellIndex) => {
                if (afterCellIndex < cellIndex) {
                    return afterCell;
                }
                if (afterCellIndex > cellIndex) {
                    return Block.create({
                        type: opts.typeCell,
                        nodes: [Text.create('')]
                    });
                }
                let newCell;
                let child = endAncestors.last().getChild(endKey);
                child = child.set(
                    'characters',
                    child.characters.take(endOffset)
                );

                endAncestors.findLast(parent => {
                    const childIndex = parent.nodes.findIndex(
                        n => n.key === child.key
                    );
                    parent = parent.set(
                        'nodes',
                        parent.nodes.set(childIndex, child).take(childIndex + 1)
                    );

                    if (parent.key !== cell.key) {
                        child = parent;
                        return false;
                    }
                    newCell = parent;
                    return true;
                });
                return newCell;
            })
        );
        node = node.updateNode(newRow);
        range = range.moveFocusToEndOf(newRow);
        return rootGetFragment(node, range);
    };
}
export default ifStartInCell;
