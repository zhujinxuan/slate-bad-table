// @flow
import { Range } from 'slate';
import type Options from '../../options';
import { type typeRule } from './type';

function ifInSameEditTable(opts: Options): typeRule {
    return (rootDelete, change, range, removeOptions, next) => {
        const { startKey, endKey } = range;
        const { document } = change.value;

        const ancestors = document.getAncestors(startKey);

        const cell = ancestors.findLast(n => n.type === opts.typeCell);
        if (!cell) {
            return next(removeOptions);
        }

        const table = ancestors.findLast(n => n.type === opts.typeTable);
        if (!table.getDescendant(endKey)) {
            return next(removeOptions);
        }
        const { deleteStartText, deleteEndText } = removeOptions;

        const row = table.getParent(cell.key);
        const startRange = range.collapseToStart();
        const endRange = range.collapseToEnd();

        // Try to delete the whole row, whole table, whole cell
        if (deleteStartText && deleteEndText) {
            if (startRange.isAtStartOf(table) && endRange.isAtEndOf(table)) {
                change.removeNodeByKey(table.key, { normalize: false });
                return change;
            }
            if (row.getDescendant(endKey)) {
                if (startRange.isAtStartOf(row) && endRange.isAtEndOf(row)) {
                    change.removeNodeByKey(row.key, { normalize: false });
                    return change;
                }
            }
            if (cell.getDescendant(endKey)) {
                return next({ ...removeOptions, deleteStartText: false });
            }
        }

        const endCell = table.getClosestBlock(endKey);
        const endRow = table.getParent(endCell.key);

        if (row !== endRow) {
            rootDelete(change, range.moveFocusToEndOf(row), {
                ...removeOptions,
                deleteEndText: true
            });

            table.nodes
                .skipWhile(r => r !== row)
                .shift()
                .find(middleRow => {
                    if (middleRow === endRow) return true;
                    change.removeNodeByKey(middleRow.key, { normalize: false });
                    return false;
                });
            return rootDelete(change, range.moveAnchorToStartOf(endRow), {
                ...removeOptions,
                deleteStartText: true
            });
        }

        if (cell === endCell) {
            return next(removeOptions);
        }

        rootDelete(change, range.moveFocusToEndOf(cell), {
            ...removeOptions,
            deleteEndText: true
        });
        row.nodes
            .skipWhile(n => n !== cell)
            .shift()
            .find(middleCell => {
                if (middleCell === endCell) return true;
                const cellRange = Range.create().moveToRangeOf(middleCell);
                rootDelete(change, cellRange, {
                    ...removeOptions,
                    deleteEndText: true,
                    deleteStartText: false
                });
                return false;
            });
        return rootDelete(change, range.moveAnchorToStartOf(endCell), {
            ...removeOptions,
            deleteStartText: true
        });
    };
}

export default ifInSameEditTable;
