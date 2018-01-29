// @flow
import { Document, Range } from 'slate';
import { type typeRule } from './type';
import type Options from '../../options';

function ifEndInCell(opts: Options): typeRule {
    return (rootGetFragment, node, range, next) => {
        const { startKey, endKey, startOffset, endOffset } = range;
        const cell = node.getClosest(endKey, x => x.type === opts.typeBadCell);
        if (!cell) {
            return next();
        }
        if (cell.getDescendant(startKey)) {
            return next();
        }
        const prevBlock = node.getPreviousBlock(cell.key);
        if (!prevBlock) {
            return Document.create({ nodes: [] });
        }
        const prevFragment = rootGetFragment(
            node,
            Range.create()
                .moveAnchorTo(startKey, startOffset)
                .moveFocusToEndOf(prevBlock)
        );
        const badCellFragment = rootGetFragment(
            node,
            Range.create()
                .moveAnchorToStartOf(cell)
                .moveFocusTo(endKey, endOffset)
        );
        return prevFragment.set(
            'nodes',
            prevFragment.nodes.concat(badCellFragment.nodes)
        );
    };
}

export default ifEndInCell;
