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
    const cell = node.getClosest(endKey, x => x.type === opts.typeBadCell);
    if (!cell) {
        return next();
    }
    const prevBlock = node.getPreviousBlock(endKey);
    if (!prevBlock) {
        return Document.create({ nodes: [] });
    }
    const prevFragment = rootGetFragment(
        node,
        Range.create()
            .moveAnchorTo(startKey, startOffset)
            .moveFocusEndOf(prevBlock)
    );
    const badCellFragment = rootGetFragment(
        node,
        Range.craete()
            .moveAnchorToStartOf(cell)
            .moveFocusTo(endKey, endOffset)
    );
    return prevFragment.set(
        'nodes',
        prevFragment.nodes.concat(badCellFragment.nodes)
    );
}

export default ifStartInCell;
