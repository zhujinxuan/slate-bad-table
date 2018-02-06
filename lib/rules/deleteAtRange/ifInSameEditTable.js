// @flow
import { Range } from 'slate';
import type Options from '../../options';
import { type typeRule } from './type';

function ifInSameEditTable(opts: Options): typeRule {
    return (rootDelete, change, range, removeOptions, next) => {
        const { startAncestors, endAncestors } = removeOptions;

        const startCellAncestorIndex = startAncestors.findLastIndex(
            n => n.object === 'block'
        );
        const startCell = startAncestors.get(startCellAncestorIndex);
        if (!startCell || startCell.type !== opts.typeCell) {
            return next(removeOptions);
        }

        const table = startAncestors.get(startCellAncestorIndex - 2);
        const endCellAncestorIndex = endAncestors.findLastIndex(
            n => n.object === 'block'
        );
        const endCell = endAncestors.get(endCellAncestorIndex);

        if (table !== endAncestors.get(endCellAncestorIndex - 2)) {
            return next(removeOptions);
        }

        if (startCell === endCell) {
            return next(removeOptions.set('deleteStartText', false));
        }

        const { deleteStartText, deleteEndText } = removeOptions;

        const startRow = startAncestors.get(startCellAncestorIndex - 1);
        const endRow = endAncestors.get(endCellAncestorIndex - 1);
        const startRange = range.collapseToStart();
        const endRange = range.collapseToEnd();

        // Try to delete the whole row, whole table, whole cell
        if (deleteStartText && deleteEndText) {
            if (startRange.isAtStartOf(table) && endRange.isAtEndOf(table)) {
                change.removeNodeByKey(table.key, { normalize: false });
                return change;
            }
            if (
                startRange.isAtStartOf(startRow) &&
                endRange.isAtEndOf(endRow)
            ) {
                const startIndex = table.nodes.indexOf(startRow);
                const endIndex = table.nodes.indexOf(endRow);
                if (startIndex > endIndex) {
                    return change;
                }
                const beforeNodes = table.nodes.take(startIndex);
                const afterNodes = table.nodes.skip(endIndex + 1);
                const nextTable = table.set(
                    'nodes',
                    beforeNodes.concat(afterNodes)
                );
                change.replaceNodeByKey(nextTable.key, nextTable, {
                    normalize: false
                });
                return change;
            }
        }

        if (startRow !== endRow) {
            // Delete the StartRow
            rootDelete(
                change,
                range.moveFocusToEndOf(startRow),
                removeOptions.set('deleteEndText', true)
            );
            const nextStartRow = table.nodes.get(
                table.nodes.indexOf(startRow) + 1
            );
            // Delete the middleRows
            if (nextStartRow !== endRow) {
                const nextEndRow = table.nodes.get(
                    table.nodes.indexOf(endRow) - 1
                );
                rootDelete(
                    change,
                    range
                        .moveAnchorToStartOf(nextStartRow)
                        .moveFocusToEndOf(nextEndRow),
                    removeOptions.merge({
                        deleteStartText: true,
                        deleteEndText: true
                    })
                );
            }
            // Delete the End Row
            return rootDelete(
                change,
                range.moveAnchorToStartOf(endRow),
                removeOptions.set('deleteStartText', true)
            );
        }

        // If In the Same Row
        rootDelete(
            change,
            range.moveFocusToEndOf(startCell),
            removeOptions.set('deleteStartText', false)
        );

        startRow.nodes
            .skipWhile(n => n !== startCell)
            .shift()
            .find(middleCell => {
                if (middleCell === endCell) return true;
                const cellRange = Range.create().moveToRangeOf(middleCell);
                rootDelete(
                    change,
                    cellRange,
                    removeOptions.merge({
                        deleteEndText: true,
                        deleteStartText: false
                    })
                );
                return false;
            });
        return rootDelete(
            change,
            range.moveAnchorToStartOf(endCell),
            removeOptions.set('deleteStartText', false)
        );
    };
}

export default ifInSameEditTable;
