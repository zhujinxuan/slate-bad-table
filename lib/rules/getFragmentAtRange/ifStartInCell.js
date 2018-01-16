// @flow
import { type Node, Range, Document } from 'slate';
import type Options from '../../options';

function ifStartInCell(
    opts: Options,
    rootGetFragment: (Node, Range) => Document,
    node: Node,
    range: Range,
    next: () => Document
): Document {
    const { startKey, endKey, startOffset, endOffset } = range;
    const cell = node.getClosest(startKey, x => x.type === opts.typeBadCell);
    if (!cell) {
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
}
export default ifStartInCell;
