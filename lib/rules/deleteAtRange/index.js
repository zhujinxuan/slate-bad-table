// @flow
import { type Change, type Range } from 'slate';
import type Options from '../../options';
import ifInSameCell from './ifInSameCell';
import ifEndInCell from './ifEndInCell';
import ifStartInCell from './ifStartInCell';

type typeRules = Array<
    (Options, (Change, Range) => Change, Change, Range, () => Change) => Change
>;

const deleteAtRangeRules = [ifStartInCell, ifEndInCell, ifInSameCell];

function bindRules(
    rules: typeRules,
    index: number,
    opts: Options,
    change: Change,
    range: Range
): Change {
    if (index === rules.length) {
        return change.deleteAtRange(range, { normalize: false });
    }
    const rule = rules[index];
    const next = () => bindRules(rules, index + 1, opts, change, range);
    const rootDeleteAtRange = (n: Change, r: Range) =>
        bindRules(deleteAtRangeRules, 0, opts, n, r);
    return rule(opts, rootDeleteAtRange, change, range, next);
}

type typeRule = (
    (Change, Range) => Change,
    Change,
    Range,
    () => Change
) => Change;
function convertSingleRule(
    opts: Options,
    optsRule: (
        Options,
        (Change, Range) => Change,
        Change,
        Range,
        () => Change
    ) => Change
): typeRule {
    return (rootDeleteAtRange, change, range, next) =>
        optsRule(opts, rootDeleteAtRange, change, range, next);
}

type typePatch = {
    rules: {
        deleteAtRange: Array<typeRule>
    },
    changes: { deleteAtRange: (Change, Range, Object) => Change }
};

function makePatch(opts: Options): typePatch {
    return {
        rules: {
            deleteAtRange: deleteAtRangeRules.map(rule =>
                convertSingleRule(opts, rule)
            )
        },
        changes: {
            deleteAtRange: (
                change,
                range,
                deleteOptions: { normalize: boolean } = { normalize: true }
            ): Change => deleteAtRange(opts, change, range, deleteOptions)
        }
    };
}
function deleteAtRange(
    opts: Options,
    change: Change,
    range: Range,
    deleteOptions: { normalize: boolean }
): Change {
    change.snapshotSelection();
    bindRules(deleteAtRangeRules, 0, opts, change, range);
    return deleteOptions.normalize ? change.normalize() : change;
}

export default makePatch;
export { deleteAtRange };
