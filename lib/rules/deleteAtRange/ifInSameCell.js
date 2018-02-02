// @flow
import type Options from '../../options';
import { type typeRule } from './type';

function ifInSameCell(opts: Options): typeRule {
    return (rootDelete, change, range, removeOptions, next) => {
        const { endAncestors, startAncestors } = removeOptions;
        const endCell = endAncestors.findLast(x => x.type === opts.typeBadCell);
        const startCell = startAncestors.findLast(
            x => x.type === opts.typeBadCell
        );
        if (!startCell || endCell !== startCell) {
            return next(removeOptions);
        }
        if (!range.collapseToStart().isAtStartOf(startCell)) {
            return next(removeOptions);
        }
        if (!range.collapseToEnd().isAtEndOf(endCell)) {
            return next(removeOptions);
        }
        const { deleteStartText, deleteEndText } = removeOptions;
        if (!deleteStartText || !deleteEndText) {
            return next(removeOptions);
        }
        change.removeNodeByKey(startCell.key, { normalize: false });
        return change;
    };
}
export default ifInSameCell;
