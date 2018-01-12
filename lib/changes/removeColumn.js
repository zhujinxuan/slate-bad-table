// @flow
import { type Change } from 'slate';
import type Options from '../options';
import removeTable from './removeTable';
import TablePosition from '../utils/TablePosition';

function removeColumn(opts: Options): Change => Change {
    return change => {
        const { value } = change;
        const { document } = value;
        const { focusKey } = value.selection;
        const { typeBadCell } = value.typeBadTable;
        const badCell = document.getClosest(
            focusKey,
            cell => cell && cell.type === typeBadCell
        );
        if (!badCell || badCell.type !== typeBadCell) {
            return change;
        }

        const position = TablePosition.create(opts, document, badCell);
        if (position.getWidth() === 1) {
            return removeTable(opts)(change);
        }
        change.snapshotSelection();

        const nextBlock = document.getNextBlock(position.badCell.key);
        if (nextBlock) {
            change.collapseToStartOf(nextBlock);
        } else {
            const prevBlock = document.getPrevBlock(position.badCell.key);
            return change.collapseToEndOf(prevBlock);
        }
        const columnIndex = position.getColumnIndex();
        position.badTable.nodes.forEach(row => {
            change.removeNodeByKey(row.nodes.get(columnIndex).key);
        });
        return change;
    };
}
export default removeColumn;
