// @flow
import { type Change, type Range } from 'slate';
import type Options from '../../options';

function ifEndInCell(
    opts: Options,
    rootDelete: (Change, Range) => Change,
    change: Change,
    range: Range,
    next: () => Change
): Change {
    const { startOffset, endOffset, startKey, endKey } = range;
    const { document } = change.value;
    const cell = document.getClosest(endKey, x => x.type === opts.typeBadCell);
    if (!cell) {
        return next();
    }
    if (cell.getDescendant(startKey)) {
        return next();
    }
    const prevBlock = document.getPreviousBlock(cell.key);
    if (prevBlock) {
        rootDelete(
            change,
            Range.create()
                .moveAnchorTo(startKey, startOffset)
                .moveFocusToEndOf(prevBlock)
        );
    }
    return rootDelete(
        change,
        Range.create()
            .moveAnchorToStartOf(cell)
            .moveFocusTo(endKey, endOffset)
    );
}

export default ifEndInCell;
