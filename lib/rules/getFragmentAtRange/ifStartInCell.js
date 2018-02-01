// @flow
import { type typeRule } from './type';
import type Options from '../../options';

function ifStartInCell(opts: Options): typeRule {
    return (rootGetFragment, node, range, next) => {
        const { startKey, endKey } = range;
        const cell = node.getClosest(
            startKey,
            x => x.type === opts.typeBadCell
        );
        if (!cell) {
            return next();
        }
        if (cell.getDescendant(endKey)) {
            return next();
        }
        const nextBlock = node.getNextBlock(cell.key);
        if (!nextBlock) {
            return rootGetFragment(cell, range.moveFocusToEndOf(cell));
        }
        const badCellFragment = rootGetFragment(
            node,
            range.moveFocusToEndOf(cell)
        );
        const nextBlockFragment = rootGetFragment(
            node,
            range.moveAnchorToStartOf(nextBlock)
        );
        return badCellFragment.set(
            'nodes',
            badCellFragment.nodes.concat(nextBlockFragment.nodes)
        );
    };
}
export default ifStartInCell;
