// @flow
import isSameWidth from './utils/isSameWidth';
import type Options from '../../options';
import { type typeRule } from './type';

function appendTableAtRangeEnd(opts: Options): typeRule {
    return (rootInsert, change, range, fragment, insertOptions, next) => {
        if (fragment.nodes.size === 0) {
            return next(insertOptions);
        }
        const lastNode = fragment.nodes.last();

        if (lastNode.type !== opts.typeTable) {
            return next(insertOptions);
        }

        const ancestors = insertOptions.endAncestors;
        const cellAncestorIndex = ancestors.findLastIndex(
            n => n.object === 'block'
        );
        const cell = ancestors.get(cellAncestorIndex);

        if (!cell || cell.type !== opts.typeCell) {
            return next(insertOptions);
        }

        const table = ancestors.get(cellAncestorIndex - 2);
        const row = ancestors.get(cellAncestorIndex - 1);

        if (row !== table.nodes.first()) {
            return next(insertOptions);
        }

        if (!isSameWidth(table, lastNode)) {
            return next(insertOptions);
        }

        const { document } = change.value;
        const { lastNodeAsText } = insertOptions;
        let nextTable = table;

        if (lastNodeAsText) {
            const fragmentRow = lastNode.nodes.last();
            const cellIndex = row.nodes.indexOf(cell);
            const nextRow = row.nodes.map((beforeCell, index) => {
                if (index > cellIndex) return beforeCell;
                const fragmentCell = fragmentRow.nodes.get(index);
                return beforeCell.set(
                    'nodes',
                    fragmentCell.nodes.concat(beforeCell.nodes)
                );
            });
            nextTable = table.set('nodes', table.nodes.set(0, nextRow));
        }

        const beforeRows = lastNodeAsText
            ? lastNode.nodes.pop()
            : lastNode.nodes;

        nextTable = nextTable.set('nodes', beforeRows.concat(nextTable.nodes));
        change.replaceNodeByKey(nextTable.key, nextTable, { normalize: false });

        fragment = fragment.set('nodes', fragment.nodes.pop());
        const prevBlock = document.getPreviousBlock(table.key);
        if (!prevBlock) {
            range = range.moveFocusToStartOf(lastNode);
        } else {
            range = range.moveFocusToEndOf(prevBlock);
        }
        if (insertOptions.startAncestors.includes(table)) {
            range = range.moveToFocus();
        }
        return rootInsert(
            change,
            range,
            fragment,
            insertOptions.set('lastNodeAsText', false)
        );
    };
}
export default appendTableAtRangeEnd;
