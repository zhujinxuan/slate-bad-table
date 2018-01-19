// @flow
import { type Change, type Node, Block } from 'slate';
import type Options from '../options';

function convertEditTable2BadTable(
    opts: Options,
    change: Change,
    table: Node
): Change {
    if (table.type !== opts.typeTable) {
        return change;
    }
    table.nodes.forEach(row => {
        row.nodes.forEach(cell => {
            cell.setNodeByKey(cell.key, opts.typeBadCell, { normalize: false });
            const newParagraph = Block.create({ type: opts.typeParagraph });
            cell.insertNodeByKey(
                cell.key,
                0,
                Block.create(opts.typeParagraph),
                { normalize: false }
            );
            cell.nodes.forEach((textOrInline, index) =>
                change.moveNodeByKey(
                    textOrInline.key,
                    newParagraph.key,
                    index,
                    { normalize: false }
                )
            );
        });
        change.setNodeByKey(row.key, opts.typeBadRow, { normalize: false });
        return true;
    });
    return change.setNodeByKey(table.key, opts.typeBadRow, {
        normalize: false
    });
}
export default convertEditTable2BadTable;
