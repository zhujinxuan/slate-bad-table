// @flow
import { type typeRule } from './type';
import type Options from '../../options';

function isInSameCell(opts: Options): typeRule {
    return (rootGetFragment, node, range, getOpts, next) => {
        const { startAncestors, endAncestors } = getOpts;
        const startCell = startAncestors.findLast(
            x => x.type === opts.typeBadCell
        );
        const endCell = endAncestors.findLast(x => x.type === opts.typeBadCell);

        if (!startCell || startCell !== endCell) {
            return next(getOpts);
        }
        if (startCell === node) {
            return next(getOpts);
        }
        return rootGetFragment(startCell, range, getOpts);
    };
}
export default isInSameCell;
