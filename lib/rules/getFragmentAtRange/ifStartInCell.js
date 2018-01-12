// @flow
import { type Node, type Range, type Document } from 'slate';
import type Options from '../../options';

function ifStartInCell(
    opts: Options,
    rootGetFragment: (Node, Range) => Document,
    node: Node,
    range: Range,
    next: () => Document
): Document {
    const { startKey, endKey, endOffset } = range;
    const cell = range.getClosest(startKey, x => x.type === opts.typeBadCell);
    if (!cell) {
        return next();
    }
    const nextBlock = node.getNextBlock(startKey);
    if (!nextBlock) {
        return Document.create({ nodes: [] });
    }
    return rootGetFragment(
        node,
        Range.create()
            .moveAnchorToStartOf(nextBlock)
            .moveFocusTo(endKey, endOffset)
    );
}
export default ifStartInCell;
