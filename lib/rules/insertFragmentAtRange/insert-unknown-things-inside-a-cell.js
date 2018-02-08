// @flow
import { isTextBlock } from 'slate-bind-copy-paste';
import { Document, Block, Text } from 'slate';
import isSameWidth from './utils/isSameWidth';
import EditTablePosition from '../../utils/EditTablePosition';
import type Options from '../../options';
import { type typeRule } from './type';
import convertEditTable2BadTable from '../../changes/convertEditTable2BadTable';

function insertUnknownInDifferentCells(opts: Options): typeRule {
    return (rootInsert, change, range, fragment, insertOptions, next) => {
        if (fragment.nodes.size === 0) {
            return next(insertOptions);
        }
        const { document } = change.value;
        const { startKey, endKey } = range;
        const startCell = document.getClosestBlock(startKey);
        const endCell = document.getClosestBlock(endKey);
        if (startCell !== endCell) {
            return next(opts);
        }

        if (startCell.type !== opts.typeCell) {
            return next(opts);
        }

        const startPosition = EditTablePosition.create({
            node: change.value.document,
            range: range.collapseToStart(),
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
                startPosition.isAtStartOfTable() &&
                isSameWidth(startPosition.table, lastTable)
            ) {
                return next(opts);
            }
        }

        const invalid = fragment.nodes.forEach(n => !isTextBlock(n));
        if (!invalid && opts.allowSoftBreak) {
            if (fragment.nodes.size === 1) {
                return next(insertOptions);
            }

            const joinedText = fragment.nodes.reduce((cache, n) => {
                const nodeText = n.getFirstText();
                const insertation =
                    nodeText === fragment.nodes.last()
                        ? nodeText
                        : nodeText.insertText(nodeText.text.length, '\n');
                return cache.set(
                    'characters',
                    cache.characters.concat(insertation.characters)
                );
            }, Text.create(''));
            fragment = Document.create({
                nodes: [
                    Block.create({
                        type: 'multi-line-paragraph-from-bad-table',
                        nodes: [joinedText]
                    })
                ]
            });
            return rootInsert(change, range, fragment, insertOptions);
        }

        let shouldInsertFragmentAsBlocks = -1;
        if (startPosition.isAtStartOfTable()) {
            shouldInsertFragmentAsBlocks = 0;
        }
        if (startPosition.isAtEndOfTable()) {
            shouldInsertFragmentAsBlocks = 1;
        }
        if (shouldInsertFragmentAsBlocks !== -1) {
            const { table } = startPosition;
            const parent = document.getParent(table);
            const insertIndex = parent.nodes.indexOf(table) + 1;
            const beforeBlocks = parent.nodes.slice(0, insertIndex);
            const afterBlocks = parent.nodes.slice(insertIndex);
            const nextParent = parent.set(
                'nodes',
                parent.nodes.set(
                    'nodes',
                    beforeBlocks.concat(fragment.nodes).concat(afterBlocks)
                )
            );
            change.replaceNodeByKey(nextParent.key, nextParent, {
                normalize: false
            });
            return change;
        }

        range = convertEditTable2BadTable(
            opts,
            change,
            startPosition.table,
            range
        );
        return rootInsert(change, range, fragment, insertOptions);
    };
}
export default insertUnknownInDifferentCells;
