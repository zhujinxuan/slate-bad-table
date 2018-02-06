// @flow
import isSameWidth from './utils/isSameWidth';
import EditTablePosition from '../../utils/EditTablePosition';
import type Options from '../../options';
import { type typeRule } from './type';

function insertBlockAtStartOfTable(opts: Options): typeRule {
    return (rootInsert, change, range, fragment, insertOptions, next) => {
        if (fragment.nodes.size === 0) {
            return next(insertOptions);
        }
        const fragmentTable = fragment.nodes.last();

        if (fragmentTable.type !== opts.typeTable) {
            return next(insertOptions);
        }

        const endPosition = EditTablePosition.create({
            node: change.value.document,
            range: range.collapseToEnd(),
            opts
        });

        if (!endPosition.isAtEndOfTable()) {
            return next(insertOptions);
        }

        const { table } = endPosition;

        if (isSameWidth(fragmentTable, table)) {
            return next(insertOptions);
        }

        const prevBlock = change.value.document.getPreviousBlock(table.key);

        if (!prevBlock) {
            return next(insertOptions);
        }
        if (range.startKey === range.endKey) {
            range = range.collapseToEndOf(prevBlock);
        } else {
            range = range.moveFocusToEndOf(prevBlock);
        }
        return rootInsert(
            rootInsert,
            range,
            insertOptions.set('lastNodeAsText', false)
        );
    };
}

export default insertBlockAtStartOfTable;
