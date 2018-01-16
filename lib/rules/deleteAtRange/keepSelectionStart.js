// @flow
import { type Change, type Range } from 'slate';
import type Options from '../../options';

function keepSelectionStart(
    opts: Options,
    rootDelete: (Change, Range) => Change,
    change: Change,
    range: Range,
    next: () => Change
): Change {
    const { startKey, endKey, startOffset, endOffset } = range;
    const { document } = change.value;
    if (startKey !== change.value.selection.startKey) {
        return next();
    }
    if (startOffset !== 0) {
        return next();
    }
    const cell = document.getClosest(
        startKey,
        x => x.type === opts.typeBadCell
    );
    if (!cell) {
        return next();
    }
    if (cell.getFirstText().key !== startKey) {
        return next();
    }
    if (!cell.getDescendant(endKey)) {
        return next();
    }

    const lastText = cell.getLastText();
    if (lastText.key !== endKey || lastText.text.length !== endOffset) {
        return next();
    }
    const prevBlock = document.getPreviousBlock(cell);
    if (prevBlock) {
        if (change.value.selection.isCollapsed) {
            change.collapseToEndOf(prevBlock);
            return next();
        }
        change.extendToEndOf(prevBlock);
        return next();
    }
    change.collapseToEnd();
    return next();
}

export default keepSelectionStart;
