// @flow
import type Options from '../../options';
import { type typeRule } from './type';

function ifInSameCell(opts: Options): typeRule {
    return (rootDelete, change, range, removeOptions, next) => {
        const { startKey, endKey } = range;
        const { document } = change.value;
        const cell = document.getClosest(
            startKey,
            x => x.type === opts.typeBadCell
        );
        if (!cell) {
            return next(removeOptions);
        }
        if (!cell.getDescendant(endKey)) {
            return next(removeOptions);
        }
        if (!range.collapseToStart().isAtStartOf(cell)) {
            return next(removeOptions);
        }
        if (!range.collapseToEnd().isAtEndOf(cell)) {
            return next(removeOptions);
        }
        if (!removeOptions.deleteStartText) {
            return next(removeOptions);
        }
        change.removeNodeByKey(cell.key, { normalize: false });
        return change;
    };
}
export default ifInSameCell;
