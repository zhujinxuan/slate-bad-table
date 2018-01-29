// @flow
import { Range } from 'slate';
import type Options from '../../options';
import { type typeRule } from './type';

function ifStartInEditCell(opts: Options): typeRule {
    return (rootDelete, change, range, removeOptions, next) => {
        const { startKey, endKey } = range;
        const { document } = change.value;

        const ancestors = document.getAncestors(startKey);

        const cell = ancestors.findLast(n => n.type === opts.typeCell);
        if (!cell) {
            return next(removeOptions);
        }

        const table = ancestors.findLast(n => n.type === opts.typeTable);
        if (table.getDescendant(endKey)) {
            // A Naive speed up when in same table
            return next(removeOptions);
        }
        const row = table.getParent(cell.key);
        table.nodes.findLast(afterRow => {
            change.removeNodeByKey(afterRow.key, { normalize: false });
            return afterRow === row;
        });
        const { deleteStartText } = removeOptions;
        if (deleteStartText && range.collapseToStart().isAtStartOf(row)) {
            change.removeNodeByKey(row.key, { normalize: false });
        } else {
            row.nodes.findLast(afterCell => {
                rootDelete(change, Range.create().moveToRangeOf(afterCell), {
                    deleteStartText: false,
                    ...removeOptions
                });
                return cell === afterCell;
            });
            rootDelete(change, range.moveFocusToEndOf(cell), {
                deleteStartText: false,
                ...removeOptions
            });
        }

        const nextText = document.getNextText(table.key);
        if (nextText) {
            removeOptions.deleteStartText = true;
            rootDelete(
                change,
                range.moveAnchorToStartOf(nextText),
                removeOptions
            );
        }
        return change;
    };
}

export default ifStartInEditCell;
