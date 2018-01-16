// @flow
function keepSelectionEnd(
    opts: Options,
    rootDelete: (Change, Range) => Change,
    change: Change,
    range: Range,
    next: () => Change
) {
    const { startKey, endKey, startOffset, endOffset } = range;
    const { document } = change.value;
    if (endKey !== change.value.selection.endKey) {
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
    const nextBlock = document.getNextBlock(cell);
    if (nextBlock) {
        if (change.value.selection.isCollapsed) {
            change.collapseToStartOf(nextBlock);
            return next();
        }
        change.extendToStartOf(nextBlock);
        return next();
    }
    change.collapseToStart();
    return next();
}

export default keepSelectionEnd;
