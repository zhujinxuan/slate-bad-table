// @flow
import { Range } from 'slate';
import type Options from '../../options';
import { type typeRule } from './type';
import convertEditTable2BadTable from '../../changes/convertEditTable2BadTable';
import isTextBlock from '../utils/isTextBlock';

function insertImage(opts: Options): typeRule {
    return (rootInsert, change, range, fragment, insertOptions, next) => {
        const { startKey, endKey, startOffset } = range;
        if (startKey === endKey) {
            return next(insertOptions);
        }
        if (fragment.nodes.size === 0) {
            return next(insertOptions);
        }

        // If paragraph type insert as paragraph
        if (isTextBlock(fragment.nodes.last())) {
            return next(insertOptions);
        }

        const cell = change.value.document.getClosestBlock(endKey);
        if (cell.type !== opts.typeCell) {
            return next(insertOptions);
        }
        const table = change.value.document.getAncestors(cell.key).get(-2);

        // Try to insert in the next block if the table is invalid
        if (!table || table.type !== opts.typeTable) {
            if (cell.getDescendant(endKey)) {
                return next(insertOptions);
            }
            const prevText = change.value.document.getPreviousText(cell.key);
            return rootInsert(
                change,
                Range.create()
                    .moveAnchorTo(startKey, startOffset)
                    .moveFocusToEndOf(prevText),
                fragment,
                insertOptions
            );
        }

        // If in a valid table;
        convertEditTable2BadTable(opts, change, table);
        const nextFragment = fragment.set('nodes', fragment.nodes.pop());
        const imageBlock = fragment.nodes.last().regenerateKey();
        change.insertBlockAtRange(range.collapseToEnd(), imageBlock, {
            normalize: false
        });
        const prevText = change.value.document.getPreviousText(imageBlock.key);
        insertOptions.lastNodeAsText = false;
        return rootInsert(
            change,
            Range.create()
                .moveAnchorTo(startKey, startOffset)
                .moveFocusToEndOf(prevText),
            nextFragment,
            insertOptions
        );
    };
}

export default insertImage;
