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
    const { startKey, endKey, startOffset } = range;
    const cell = range.getClosest(endKey, x => x.type === opts.typeBadCell);
    if (!cell) {
        return next();
    }
    const prevBlock = node.getPreviousBlock(endKey);
    if (!prevBlock) {
        return Document.create({ nodes: [] });
    }
    return rootGetFragment(
        node,
        Range.create()
            .moveAnchorTo(startKey, startOffset)
            .moveFocusEndOf(prevBlock)
    );
}

export default ifStartInCell;
