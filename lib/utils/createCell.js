// @flow
import { Block, Text } from 'slate';
import { List } from 'immutable';
import type TablePosition from './TablePosition';

function createCell(position: TablePosition): Block {
    const { opts } = position;
    return Block.create({
        type: opts.typeBadCell,
        nodes: List.of(
            Block.create({
                type: opts.typeParagraph,
                nodes: List.of(Text.create(''))
            })
        )
    });
}
export default createCell;
