// @flow
import { type typeRule } from './type';
import type Options from '../../options';

function isInSameCell(opts: Options): typeRule {
    return (rootGetFragment, node, range, next) => {
        const { startKey, endKey } = range;
        const cell = node.getClosest(
            startKey,
            x => x.type === opts.typeBadCell
        );
        if (!cell) {
            return next();
        }
        if (!cell.getDescendant(endKey)) {
            return next();
        }

        if (node.type !== opts.typeBadCell) {
            return rootGetFragment(cell, range);
        }
        return next();
    };
}
export default isInSameCell;
