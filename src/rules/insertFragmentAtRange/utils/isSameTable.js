// @flow
import { type Node } from 'slate';
import type Options from '../../../options';
import { type OperationOptions } from './type';

function isSameTable(opts: Options, cache: OperationOptions): void | Node {
    const { startAncestors, endAncestors } = cache;
    const cellIndex = startAncestors.findLastIndex(n => n.object === 'block');
    const cell = startAncestors.get(cellIndex);
    if (!cell || cell !== opts.typeCell) {
        return null;
    }
    const table = startAncestors.get(cellIndex - 2);
    return endAncestors.includes(table) ? table : null;
}
export default isSameTable;
