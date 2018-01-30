// @flow

import type Options from '../../options';
import { type typeRule } from './type';
import convertEditTable2BadTable from '../../changes/convertEditTable2BadTable';
import isTextBlock from '../utils/isTextBlock';

function insertImage(opts: Options): typeRule {
    return (rootInsert, change, range, fragment, insertOptions, next) => {
        const { startKey, endKey } = range;

        if (fragment.nodes.size === 0) {
            return next(insertOptions);
        }

        if (fragment.nodes.first().type === opts.typeParagraph) {
            return next(insertOptions);
        }
        if (isTextBlock(fragment.nodes.first())) {
            return next(insertOptions);
        }

        const cell = change.value.document.getClosestBlock(startKey);
        if (cell.type !== opts.typeCell) {
            return next(insertOptions);
        }

        const table = change.value.document.getAncestors(cell.key).get(-2);
        if (!table || table.type !== opts.typeTable) {
            if (cell.getDescendant(endKey)) {
                return next(insertOptions);
            }
            const nextBlock = change.value.document.getNextBlock(cell.key);
            return rootInsert(
                change,
                range.moveAnchorToStartOf(nextBlock),
                fragment,
                insertOptions
            );
        }

        convertEditTable2BadTable(opts, change, table);
        const nextFragment = fragment.set('nodes', fragment.nodes.unshift());
        const imageBlock = fragment.nodes.first().regenerateKey();
        change.insertBlockAtRange(range.collapseToStart(), imageBlock, {
            normalize: false
        });
        const nextBlock = change.value.document.getNextBlock(imageBlock.key);
        return rootInsert(
            change,
            range.moveAnchorToStartOf(nextBlock),
            fragment,
            nextFragment
        );
    };
}
export default insertImage;
