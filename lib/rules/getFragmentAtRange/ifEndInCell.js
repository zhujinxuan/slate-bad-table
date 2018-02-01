// @flow
import { type typeRule } from './type';
import type Options from '../../options';

function ifEndInCell(opts: Options): typeRule {
    return (rootGetFragment, node, range, next) => {
        const { startKey, endKey } = range;
        const cell = node.getClosest(endKey, x => x.type === opts.typeBadCell);
        if (!cell) {
            return next();
        }
        if (cell.getDescendant(startKey)) {
            return next();
        }
        const prevBlock = node.getPreviousBlock(cell.key);
        if (!prevBlock) {
            return rootGetFragment(cell, range.moveAnchorToStartOf(cell));
        }
        const prevFragment = rootGetFragment(
            node,
            range.moveFocusToEndOf(prevBlock)
        );
        const badCellFragment = rootGetFragment(
            node,
            range.moveAnchorToStartOf(cell)
        );
        return prevFragment.set(
            'nodes',
            prevFragment.nodes.concat(badCellFragment.nodes)
        );
    };
}

export default ifEndInCell;
