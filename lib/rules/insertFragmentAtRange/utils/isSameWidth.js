// @flow
import { type Node } from 'slate';

function isSameWidth(table: Node, fragmentTable: Node): boolean {
    const rowSize = table.nodes.first().nodes.size;
    const invalid = fragmentTable.nodes.find(r => r.nodes.size !== rowSize);
    return !invalid;
}
export default isSameWidth;
