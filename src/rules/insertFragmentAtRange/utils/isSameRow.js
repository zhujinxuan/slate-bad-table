// @flow
import { type Node } from 'slate';
import type Options from '../../../options';
import { type OperationOptions } from './type';

function isSameRow(opts: Options, cache: OperationOptions): void | Node {
    const { startAncestors, endAncestors } = cache;
    const startRow = startAncestors.findLast(n => n.type === opts.typeRow);
    if (!startRow) {
        return null;
    }
    const endRow = endAncestors.findLast(n => n.type === opts.typeRow);
    return startRow === endRow ? startRow : null;
}
export default isSameRow;
