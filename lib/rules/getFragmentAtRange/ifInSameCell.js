// @flow
import { type Node, type Range, type Document } from 'slate';
import type Options from '../../options';

function isInSameCell(
    opts: Options,
    rootGetFragment: (Node, Range) => Document,
    node: Node,
    range: Range,
    next: () => Document
): Document {
    const { startKey, endKey } = range;
    const cell = node.getClosest(startKey, x => x.type === opts.typeBadCell);
    if (!cell) {
        return next();
    }
    if (!cell.getDescandent(endKey)) {
        return next();
    }

    if (node.type === opts.typeBadCell) {
        return rootGetFragment(cell, range);
    }
    return cell.getFragmentAtRange(range);
}
export default isInSameCell;
