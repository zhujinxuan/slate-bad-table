// @flow
import { type Range } from 'slate';
import type Options from '../../../options';
import { type OperationOptions } from './type';

function isRangeStartAtLastRowOfTable(
    opts: Options,
    range: Range,
    cache: OperationOptions
): boolean {
    const { startAncestors } = cache;
    const cellIndex = startAncestors.findLastIndex(n => n.object === 'block');
    const cell = startAncestors.get(cellIndex);
    if (!cell || cell !== opts.typeCell) {
        return false;
    }
    const table = startAncestors.get(cellIndex - 2);
    const row = startAncestors.get(cellIndex - 1);
    return row === table.nodes.last();
}
export default isRangeStartAtLastRowOfTable;
