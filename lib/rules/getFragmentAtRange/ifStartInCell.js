// @flow
import { Range, Document } from 'slate';
import { type typeRule } from './type';
import type Options from '../../options';

function ifStartInCell(opts: Options): typeRule {
    return (rootGetFragment, node, range, next) => {
        const { startKey, endKey, startOffset, endOffset } = range;
        const cell = node.getClosest(
            startKey,
            x => x.type === opts.typeBadCell
        );
        if (!cell) {
            return next();
        }
        if (cell.getDescendant(endKey)) {
            return next();
        }
        const nextBlock = node.getNextBlock(cell.key);
        if (!nextBlock) {
            return Document.create({ nodes: [] });
        }
        const badCellFragment = rootGetFragment(
            node,
            Range.create()
                .moveAnchorTo(startKey, startOffset)
                .moveFocusToEndOf(cell)
        );
        const nextBlockFragment = rootGetFragment(
            node,
            Range.create()
                .moveAnchorToStartOf(nextBlock)
                .moveFocusTo(endKey, endOffset)
        );
        return badCellFragment.set(
            'nodes',
            badCellFragment.nodes.concat(nextBlockFragment.nodes)
        );
    };
}
export default ifStartInCell;
