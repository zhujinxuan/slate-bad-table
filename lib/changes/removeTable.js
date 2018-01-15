// @flow
import { type Change } from 'slate';
import type Options from '../options';

function removeTable(opts: Options): Change => Change {
    return change => {
        const { value } = change;
        const { document } = value;
        const { focusKey } = value.selection;
        const { typeBadTable } = opts;
        const table = document.getClosest(
            focusKey,
            cell => cell && cell.type === typeBadTable
        );
        if (!table || table.type !== typeBadTable) {
            return change;
        }
        change.snapshotSelection();

        const nextBlock = document.getNextBlock(table.key);
        if (nextBlock) {
            change.removeNodeByKey(table.key).collapseToStartOf(nextBlock);
            return change;
        }
        const prevBlock = document.getPreviousBlock(table.key);
        if (prevBlock) {
            change.removeNodeByKey(table.key).collapseToEndOf(prevBlock);
            return change
        }
        return change.removeNodeByKey(table.key);
    };
}
export default removeTable;
