// @flow
import isSameWidth from './utils/isSameWidth';
import EditTablePosition from '../../utils/EditTablePosition';
import type Options from '../../options';
import { type typeRule } from './type';

function insertBlockAtEndOfTable(opts: Options): typeRule {
    return (rootInsert, change, range, fragment, insertOptions, next) => {
        if (fragment.nodes.size === 0) {
            return next(insertOptions);
        }
        const fragmentTable = fragment.nodes.first();

        if (fragmentTable.type !== opts.typeTable) {
            return next(insertOptions);
        }

        const startPosition = EditTablePosition.create({
            node: change.value.document,
            range: range.collapseToStart(),
            opts
        });

        if (!startPosition.isAtEndOfTable()) {
            return next(insertOptions);
        }

        const { table } = startPosition;

        if (isSameWidth(fragmentTable, table)) {
            return next(insertOptions);
        }

        const nextBlock = change.value.document.getNextBlock(table.key);

        if (!nextBlock) {
            return next(insertOptions);
        }
        if (range.startKey === range.endKey) {
            range = range.collapseToStartOf(nextBlock);
        } else {
            range = range.moveAnchorToStartOf(nextBlock);
        }
        return rootInsert(
            rootInsert,
            range,
            insertOptions.set('firstNodeAsText', false)
        );
    };
}

export default insertBlockAtEndOfTable;
