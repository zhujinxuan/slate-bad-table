// @flow
import { type Change } from 'slate';
import type Options from '../options';
import removeTable from './removeTable';
import TablePosition from '../utils/TablePosition';

type typeRemoveOptions = {
    shouldSnapshotSelection: boolean
};
function removeColumn(opts: Options): (Change, typeRemoveOptions) => Change {
    return (change, removeOptions = { shouldSnapshotSelection: true }) => {
        const { value } = change;
        const { document } = value;
        const { focusKey } = value.selection;
        const { typeBadCell } = opts;
        const badCell = document.getClosest(
            focusKey,
            cell => cell && cell.type === typeBadCell
        );
        if (!badCell || badCell.type !== typeBadCell) {
            return change;
        }

        const position = TablePosition.create(opts, document, badCell);
        if (position.getWidth() === 1) {
            return removeTable(opts)(change, removeOptions);
        }
        if (removeOptions.shouldSnapshotSelection) {
            change.snapshotSelection();
        }

        const nextBlock = document.getNextBlock(position.badCell.key);
        if (nextBlock) {
            change.collapseToStartOf(nextBlock);
        } else {
            const prevBlock = document.getPrevBlock(position.badCell.key);
            if (prevBlock) {
                change.collapseToEndOf(prevBlock);
            }
        }
        const columnIndex = position.getColumnIndex();
        position.badTable.nodes.forEach(row => {
            change.removeNodeByKey(row.nodes.get(columnIndex).key);
        });
        return change;
    };
}
export default removeColumn;
