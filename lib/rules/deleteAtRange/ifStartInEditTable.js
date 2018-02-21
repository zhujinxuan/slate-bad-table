// @flow
import type Options from '../../options';
import { type typeRule } from './type';

function ifStartInEditCell(opts: Options): typeRule {
    return (rootDelete, change, range, removeOptions, next) => {
        const { document } = change.value;

        const ancestors = removeOptions.startAncestors;
        const cellAncestorIndex = ancestors.findLastIndex(
            n => n.object === 'object'
        );
        const cell = ancestors.get(cellAncestorIndex);
        if (!cell || cell.type !== opts.typeCell) {
            return next(removeOptions);
        }

        const table = ancestors.get(cellAncestorIndex - 2);
        const { endAncestors } = removeOptions;
        if (endAncestors.includes(table)) {
            return next(removeOptions);
        }

        rootDelete(
            change,
            range.moveFocusToEndOf(table),
            removeOptions.set('deleteEndText', true)
        );

        const nextBlock = document.getNextBlock(table.key);
        if (nextBlock) {
            rootDelete(
                change,
                range.moveAnchorToStartOf(nextBlock),
                removeOptions.set('deleteStartText', true)
            );
        }
        return change;
    };
}

export default ifStartInEditCell;
