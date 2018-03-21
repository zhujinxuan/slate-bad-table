// @flow
import { type Range } from 'slate';
import type Options from '../../../options';
import { type OperationOptions } from './type';

function isRangeEndAtFistRowOfTable(
    opts: Options,
    range: Range,
    cache: OperationOptions
): boolean {
    const { endAncestors } = cache;
    const cellIndex = endAncestors.findLastIndex(n => n.object === 'block');
    const cell = endAncestors.get(cellIndex);
    if (!cell || cell !== opts.typeCell) {
        return false;
    }
    const table = endAncestors.get(cellIndex - 2);
    const row = endAncestors.get(cellIndex - 1);
    return row === table.nodes.first();
}
export default isRangeEndAtFistRowOfTable;
