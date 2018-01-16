// @flow
import { type Change, type Range } from 'slate';
import type Options from '../../options';

function ifStartInCell(
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
    if (cell.getDescendant(endKey)) {
        return next();
    }
    const nextBlock = document.getNextBlock(cell.key);
    rootDelete(
        change,
        Range.create()
            .moveAnchorTo(startKey, startOffset)
            .moveFocusToEndOf(cell)
    );
    if (nextBlock) {
        rootDelete(
            change,
            Range.create()
                .moveAnchorToStartOf(nextBlock)
                .moveFocusTo(endKey, endOffset)
        );
    }
    return change;
}

export default ifStartInCell;
