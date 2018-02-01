// @flow
import { Block, Text } from 'slate';
import { type typeRule } from './type';
import type Options from '../../options';

function ifStartInCell(opts: Options): typeRule {
    return (rootGetFragment, node, range, next) => {
        const { startKey, endKey, startOffset } = range;
        const startAncestors = node.getAncestors(startKey);
        const cell = startAncestors.findLast(n => n.object === 'block');
        if (!cell || cell.type !== opts.typeCell) {
            return next();
        }
        if (cell.getDescendant(endKey)) {
            return next();
        }

        const table = startAncestors.findLast(n => n.type === opts.typeTable);

        const row = table.getParent(cell.key);
        if (cell === row.nodes.first()) {
            return next();
        }

        const cellIndex = row.nodes.indexOf(cell);
        const newRow = row.set(
            'nodes',
            row.nodes.map((beforeCell, beforeCellIndex) => {
                if (beforeCellIndex > cellIndex) {
                    return beforeCell;
                }
                if (beforeCellIndex < cellIndex) {
                    return Block.create({
                        type: opts.typeCell,
                        nodes: [Text.create('')]
                    });
                }
                let newCell;
                let child = startAncestors.last().getChild(startKey);
                child = child.set(
                    'characters',
                    child.characters.skip(startOffset)
                );

                startAncestors.findLast(parent => {
                    const childIndex = parent.nodes.findIndex(
                        n => n.key === child.key
                    );
                    parent = parent.set(
                        'nodes',
                        parent.nodes.set(childIndex, child).skip(childIndex)
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
        return rootGetFragment(
            node.updateNode(newRow),
            range.moveAnchorToStartOf(newRow)
        );
    };
}
export default ifStartInCell;
