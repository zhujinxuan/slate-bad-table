// @flow

import { type Change, Range, type Document } from 'slate';
import type Options from '../../options';
import convertEditTable2BadTable from '../../changes/convertEditTable2BadTable';

function insertImage(
    opts: Options,
    rootInsert: (Change, Range, Document) => Change,
    change: Change,
    range: Range,
    fragment: Document,
    next: () => Change
): Change {
    const { startKey, endKey, endOffset } = range;

    if (fragment.nodes.size === 0) {
        return next();
    }

    if (fragment.nodes.first().type === opts.typeParagraph) {
        return next();
    }

    const cell = change.value.document.getClosestBlock(startKey);
    if (cell.type !== opts.typeCell) {
        return next();
    }
    const table = change.value.document.getAncestors(cell.key).get(-2);
    if (!table || table.type !== opts.typeTable) {
        if (cell.getDescendant(endKey)) {
            return next();
        }
        const nextText = change.value.document.getNextText(cell.key);
        return rootInsert(
            change,
            Range.create()
                .moveAnchorToStartOf(nextText)
                .moveFocusTo(endKey, endOffset),
            fragment
        );
    }

    convertEditTable2BadTable(opts, change, table);
    const nextFragment = fragment.set('nodes', fragment.nodes.unshift());
    const imageBlock = fragment.nodes.first().regenerateKey();
    change.insertBlockAtRange(range.collapseToStart(), imageBlock, {
        normalize: false
    });
    const nextText = change.value.document.getNextText(imageBlock);
    return rootInsert(
        change,
        Range.create()
            .moveAnchorToStartOf(nextText)
            .moveFocusTo(endKey, endOffset),
        nextFragment
    );
}
export default insertImage;
