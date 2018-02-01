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

        return rootGetFragment(cell, range);
    };
}
export default isInSameCell;
