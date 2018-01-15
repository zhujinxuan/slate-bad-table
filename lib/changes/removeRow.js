// @flow
import { type Change } from 'slate';
import type Options from '../options';
import removeTable from './removeTable';
import TablePosition from '../utils/TablePosition';

type typeRemoveOptions = {
    shouldSnapshotSelection: boolean
};
function removeRow(opts: Options): (Change, typeRemoveOptions) => Change {
    return (change, removeOptions = { shouldSnapshotSelection: true }) => {
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
        if (position.getHeight() === 1) {
            return removeTable(opts)(change);
        }
        if (removeOptions.shouldSnapshotSelection) {
            change.snapshotSelection();
        }

        const nextBlock = document.getNextBlock(position.badRow.key);
        if (nextBlock) {
            change.collapseToStartOf(nextBlock);
        } else {
            const prevBlock = document.getPrevBlock(position.badRow.key);
            return change.collapseToEndOf(prevBlock);
        }
        change.removeNodeByKey(position.badRow.key);
        return change;
    };
}

export default removeRow;
