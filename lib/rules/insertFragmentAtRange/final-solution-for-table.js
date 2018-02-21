// @flow
import EditTablePosition from '../../utils/EditTablePosition';
import type Options from '../../options';
import { type typeRule } from './type';

function finalSolutionToJumpOutOfATable(opts: Options): typeRule {
    return (rootInsert, change, range, fragment, insertOptions, next) => {
        if (fragment.nodes.size === 0) {
            return next(insertOptions);
        }

        const { document } = change.value;
        const { startKey, endKey } = range;
        const startCell = document.getClosestBlock(startKey);

        if (startCell.type !== opts.typeCell) {
            return next(opts);
        }
        const startPosition = EditTablePosition.create({
            node: change.value.document,
            range: range.collapseToStart(),
            opts
        });
        const nextBlock = document.getNextBlock(startPosition.table.key);
        if (!nextBlock) {
            fragment.nodes.forEach((n, index) => {
                change.insertNodeByKey(
                    document.key,
                    document.nodes.size + index,
                    n,
                    { normalize: false }
                );
            });
            return change;
        }
        range = range.moveAnchorToStartOf(nextBlock);
        insertOptions = insertOptions.merge({
            firstNodeAsText: false,
            lastNodeAsText: false
        });
        if (startPosition.table.getDescendant(endKey)) {
            range = range.moveToStartOf(nextBlock);
        }
        return rootInsert(change, range, fragment, insertOptions);
    };
}
export default finalSolutionToJumpOutOfATable;
