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
    const { startKey, endKey, startOffset } = range;
    if (startKey === endKey) {
        return next();
    }
    if (fragment.nodes.size === 0) {
        return next();
    }

    if (fragment.nodes.last().type === opts.typeParagraph) {
        return next();
    }

    const cell = change.value.document.getClosestBlock(endKey);
    if (cell.type !== opts.typeCell) {
        return next();
    }
    const table = change.value.document.getAncestors(cell.key).get(-2);
    if (!table || table.type !== opts.typeTable) {
        if (cell.getDescendant(endKey)) {
            return next();
        }
        const prevText = change.value.document.getPreviousText(cell.key);
        return rootInsert(
            change,
            Range.create()
                .moveAnchorTo(startKey, startOffset)
                .moveFocusToEndOf(prevText),
            fragment
        );
    }

    convertEditTable2BadTable(opts, change, table);
    const nextFragment = fragment.set('nodes', fragment.nodes.pop());
    const imageBlock = fragment.nodes.last().regenerateKey();
    change.insertBlockAtRange(range.collapseToEnd(), imageBlock, {
        normalize: false
    });
    const prevText = change.value.document.getPreviousText(imageBlock);
    return rootInsert(
        change,
        Range.create()
            .moveAnchorTo(startKey, startOffset)
            .moveFocusToEndOf(prevText),
        nextFragment
    );
}
export default insertImage;
