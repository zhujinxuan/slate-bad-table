// @flow
import isSameWidth from './utils/isSameWidth';
import type Options from '../../options';
import { type typeRule } from './type';

function appendTableAtRangeStart(opts: Options): typeRule {
    return (rootInsert, change, range, fragment, insertOptions, next) => {
        if (fragment.nodes.size === 0) {
            return next(insertOptions);
        }
        const firstNode = fragment.nodes.first();

        if (firstNode.type !== opts.typeTable) {
            return next(insertOptions);
        }

        const ancestors = insertOptions.startAncestors;
        const cellAncestorIndex = ancestors.findLastIndex(
            n => n.object === 'block'
        );
        const cell = ancestors.get(cellAncestorIndex);

        if (!cell || cell.type !== opts.typeCell) {
            return next(insertOptions);
        }

        const table = ancestors.get(cellAncestorIndex - 2);
        const row = ancestors.get(cellAncestorIndex - 1);
        if (row !== table.nodes.last()) {
            // split node if necessary
            return next(opts);
        }

        if (!isSameWidth(table, firstNode)) {
            return next(insertOptions);
        }

        const { document } = change.value;
        const { firstNodeAsText } = insertOptions;
        let nextTable = table;

        if (firstNodeAsText) {
            const fragmentRow = firstNode.nodes.first();
            const cellIndex = row.nodes.indexOf(cell);
            const nextRow = row.nodes.map((afterCell, index) => {
                if (index < cellIndex) return afterCell;
                const fragmentCell = fragmentRow.nodes.get(index);
                return afterCell.set(
                    'nodes',
                    afterCell.nodes.concat(fragmentCell.nodes)
                );
            });
            nextTable = table.set('nodes', table.nodes.set(-1, nextRow));
        }

        const afterRows = firstNodeAsText
            ? firstNode.nodes.shift()
            : firstNode.nodes;

        nextTable = nextTable.set('nodes', nextTable.nodes.concat(afterRows));
        change.replaceNodeByKey(nextTable.key, nextTable, { normalize: false });

        fragment = fragment.set('nodes', fragment.nodes.shift());
        const nextBlock = document.getNextBlock(table.key);
        if (!nextBlock) {
            range = range.moveAnchorToEndOf(firstNode);
        } else {
            range = range.moveAnchorToStartOf(nextBlock);
        }
        if (insertOptions.endAncestors.includes(table)) {
            range = range.moveToAnchor();
        }
        return rootInsert(
            change,
            range,
            fragment,
            insertOptions.set('firstNodeAsText', false)
        );
    };
}
export default appendTableAtRangeStart;
