// @flow
import { Block } from 'slate';
import { Range } from 'immutable';
import type TablePosition from './TablePosition';
import createCell from './createCell';

function createRow(position: TablePosition): Block {
    const { opts } = position;
    return Block.create({
        type: opts.typeBadRow,
        nodes: Range(position.getWidth())
            .toList()
            .map(() => createCell(position))
    });
}
export default createRow;
