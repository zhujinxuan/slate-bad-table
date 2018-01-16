// @flow
import { type Change, type Range } from 'slate';
import type Options from '../../options';

function ifInSameCell(
    opts: Options,
    rootDelete: (Change, Range) => Change,
    change: Change,
    range: Range,
    next: () => Change
): Change {
    const { startOffset, endOffset, startKey, endKey } = range;
    const { document } = change.value;
    const cell = document.getClosest(
        startKey,
        x => x.type === opts.typeBadCell
    );
    if (!cell) {
        return next();
    }
    if (!cell.getDescendant(endKey)) {
        return next();
    }
    if (startOffset === 0 && startKey === cell.getFirstText().key) {
        const lastText = cell.getLastText();
        if (lastText.key === endKey) {
            if (lastText.text.length === endOffset) {
                change.removeNodeByKey(cell.key, { normalize: false });
            }
        }
    }
    return next();
}

export default ifInSameCell;
