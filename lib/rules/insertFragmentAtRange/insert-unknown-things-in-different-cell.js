// @flow
import isSameWidth from './utils/isSameWidth';
import EditTablePosition from '../../utils/EditTablePosition';
import type Options from '../../options';
import { type typeRule } from './type';

function insertUnknownInDifferentCells(opts: Options): typeRule {
    return (rootInsert, change, range, fragment, insertOptions, next) => {
        if (fragment.nodes.size === 0) {
            return next(insertOptions);
        }
        const { document } = change.value;
        const { startKey, endKey } = range;
        const startCell = document.getClosestBlock(startKey);
        const endCell = document.getClosestBlock(endKey);
        if (startCell === endCell) {
            return next(opts);
        }

        if (
            startCell.type !== opts.typeCell &&
            endCell.type !== opts.typeCell
        ) {
            return next(opts);
        }

        const startPosition = EditTablePosition.create({
            node: change.value.document,
            range: range.collapseToStart(),
            opts
        });
        const endPosition = EditTablePosition.create({
            node: change.value.document,
            range: range.collapseToEnd(),
            opts
        });

        const firstTable = fragment.nodes.first();
        const lastTable = fragment.nodes.last();
        if (
            firstTable.type === opts.typeCell &&
            startCell.type === opts.typeCell
        ) {
            if (
                startPosition.isAtEndOfTable() &&
                isSameWidth(startPosition.table, firstTable)
            ) {
                return next(opts);
            }
        }

        if (
            lastTable.type === opts.typeCell &&
            endCell.type === opts.typeCell
        ) {
            if (
                endPosition.isAtStartOfTable() &&
                isSameWidth(endPosition.table, lastTable)
            ) {
                return next(opts);
            }
        }

        return rootInsert(
            change,
            range.collapseToStart(),
            fragment,
            insertOptions
        );
    };
}
export default insertUnknownInDifferentCells;
