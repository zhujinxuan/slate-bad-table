// @flow
import isSameWidth from './utils/isSameWidth';
import pasteSingleRow from './utils/pasteSingleRow';
import type Options from '../../options';
import { type typeRule } from './type';

function insertTableInsideTable(opts: Options): typeRule {
    return (rootInsert, change, range, fragment, insertOptions, next) => {
        if (fragment.nodes.size !== 1) {
            return next(insertOptions);
        }
        const { lastNodeAsText, firstNodeAsText } = insertOptions;
        if (!lastNodeAsText || !firstNodeAsText) {
            return next(insertOptions);
        }
        const lastNode = fragment.nodes.last();

        if (lastNode.type !== opts.typeTable) {
            return next(insertOptions);
        }

        const { startAncestors, endAncestors } = insertOptions;
        const startCellAncestorIndex = startAncestors.findLastIndex(
            n => n.object === 'block'
        );
        const startCell = startAncestors.get(startCellAncestorIndex);

        if (!startCell || startCell.type !== opts.typeCell) {
            return next(insertOptions);
        }

        const table = startAncestors.get(startCellAncestorIndex - 2);
        if (!isSameWidth(table, lastNode)) {
            return next(insertOptions);
        }

        if (!endAncestors.includes(table)) {
            return next(insertOptions);
        }
        const startRow = startAncestors.get(startCellAncestorIndex - 1);
        const endCellAncestorIndex = endAncestors.findLastIndex(
            n => n.object === 'block'
        );
        const endCell = endAncestors.get(endCellAncestorIndex);
        const endRow = endAncestors.get(endCellAncestorIndex - 1);

        const startCellIndex = startRow.nodes.indexOf(startCell);
        const endCellIndex = startRow.nodes.indexOf(endCell);
        if (startRow === endRow) {
            const fragmentRow = lastNode.nodes.first();
            const nextRow = pasteSingleRow(
                startRow,
                fragmentRow,
                startCellIndex,
                endCellIndex
            );
            change.replaceNodeByKey(nextRow.key, nextRow, { normalize: false });
            return change;
        }

        let middleRows = lastNode.nodes;
        let nextTable = table;
        const startRowIndex = table.nodes.indexOf(startRow);
        if (firstNodeAsText) {
            middleRows = middleRows.shift();
            const fragmentRow = lastNode.nodes.first();
            const nextRow = pasteSingleRow(
                startRow,
                fragmentRow,
                startCellIndex,
                -1
            );
            nextTable = nextTable.setIn(['nodes', startRowIndex], nextRow);
        }

        const endRowIndex = table.nodes.indexOf(endRow);
        if (lastNodeAsText && middleRows.nodes.size > 0) {
            middleRows = middleRows.pop();
            const fragmentRow = lastNode.nodes.last();
            const nextRow = pasteSingleRow(
                startRow,
                fragmentRow,
                0,
                endCellIndex
            );
            nextTable = nextTable.setIn(['nodes', endRowIndex], nextRow);
        }

        nextTable = nextTable.set(
            'nodes',
            nextTable.nodes
                .take(startRowIndex + 1)
                .concat(middleRows, nextTable.nodes.skip(startRowIndex + 1))
        );
        change.replaceNodeByKey(nextTable.key, nextTable, { normalize: false });
        return change;
    };
}

export default insertTableInsideTable;
