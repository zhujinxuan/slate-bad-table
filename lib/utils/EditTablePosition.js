// @flow
import { Record, List } from 'immutable';
import { type Node, Block, Range } from 'slate';

import type Options from '../options';

type typeAttrs = {
    node: Node,
    range: Range,
    opts: Options
};
class TablePosition extends Record({
    table: Block.create('invalid-block'),
    row: Block.create('invalid-block'),
    cell: Block.create('invalid-block'),
    rowIndex: -1,
    cellIndex: -1,
    ancestors: List.of(),
    range: Range.create()
}) {
    static create(attrs: typeAttrs) {
        const { node, range, opts } = attrs;
        if (!node) {
            throw new Error('node must be set for TablePosition');
        }
        if (!range) {
            throw new Error('attrs.range must be set for TablePosition');
        }
        if (range.isExpanded) {
            throw new Error('attrs.range must be collapsed for TablePosition');
        }
        if (!opts) {
            throw new Error('attrs.opts must have types for TablePosition');
        }

        const cell = node.getClosestBlock(range.startKey);

        if (cell.type !== opts.typeCell) {
            return new TablePosition({ range });
        }
        const { startKey } = range;
        const ancestors = node.getAncestors(startKey);
        const cellAncestorIndex = ancestors.indexOf(cell);
        const table = ancestors.get(cellAncestorIndex - 2);
        const row = ancestors.get(cellAncestorIndex - 1);
        const rowIndex = table.nodes.indexOf(row);
        const cellIndex = row.nodes.indexOf(cell);
        return new TablePosition({
            table,
            row,
            cell,
            rowIndex,
            cellIndex,
            ancestors,
            range
        });
    }

    isSameTable(position2: TablePosition): boolean {
        return this.rowIndex !== -1 && this.table === position2.table;
    }

    isSameRow(position2: TablePosition): boolean {
        return this.cellIndex !== -1 && this.row === position2.row;
    }

    isSameCell(position2: TablePosition): boolean {
        return this.cellIndex !== -1 && this.cell === position2.cell;
    }

    isFirstRow(): boolean {
        return this.rowIndex === 0;
    }

    isLastRow(): boolean {
        return this.rowIndex === this.table.nodes.size - 1;
    }

    isFirstCell(): boolean {
        return this.cellIndex === 0;
    }

    isLastCell(): boolean {
        return this.cellIndex === this.row.nodes.size;
    }
    isAtStartOfTable(): boolean {
        return this.rowIndex !== -1 && this.range.isAtStartOf(this.table);
    }
    isAtEndOfTable(): boolean {
        return this.rowIndex !== -1 && this.range.isAtEndOf(this.table);
    }

    table: void | Block;
    row: void | Block;
    cell: void | Block;
    rowIndex: number;
    cellIndex: number;
    ancestors: List<Node>;
    range: Range;
}
export default TablePosition;
