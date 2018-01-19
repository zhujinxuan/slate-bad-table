// @flow
import { type Change, type Range, type Document } from 'slate';
import type Options from '../../options';
import { deleteAtRange } from '../deleteAtRange/index';

type typeRules = Array<
    (
        Options,
        (Change, Range, Document) => Change,
        Change,
        Range,
        Document,
        () => Change
    ) => Change
>;

const insertFragmentRules = [];

function bindRules(
    rules: typeRules,
    index: number,
    opts: Options,
    change: Change,
    range: Range,
    fragment: Document
): Change {
    if (index === rules.length) {
        change.insertFragmentAtRange(range.moveToAnchor(), {
            normalize: false
        });
        return change;
    }
    const rule = rules[index];
    const next = () =>
        bindRules(rules, index + 1, opts, change, range, fragment);
    const rootInsert = (c: Change, r: Range, f: Document) =>
        bindRules(insertFragmentRules, 0, opts, c, r, f);
    return rule(opts, rootInsert, change, range, fragment, next);
}

type typeRule = (
    (Change, Range, Document) => Change,
    Change,
    Range,
    Document,
    () => Change
) => Change;
function convertSingleRule(
    opts: Options,
    optsRule: (
        Options,
        (Change, Range, Document) => Change,
        Change,
        Range,
        Document,
        () => Change
    ) => Change
): typeRule {
    return (rootInsert, change, range, fragment, next) =>
        optsRule(opts, rootInsert, change, range, fragment, next);
}

type typePatch = {
    rules: {
        insertFragmentAtRange: Array<typeRule>
    },
    changes: {
        insertFragmentAtRange: (Change, Range, Document, Object) => Change
    }
};

function makePatch(opts: Options): typePatch {
    return {
        rules: {
            insertFragmentAtRange: insertFragmentRules.map(rule =>
                convertSingleRule(opts, rule)
            )
        },
        changes: {
            insertFragmentAtRange: (
                change,
                range,
                fragment,
                insertOptions: { normalize: boolean } = { normalize: true }
            ) =>
                insertFragmentAtRange(
                    opts,
                    change,
                    range,
                    fragment,
                    insertOptions
                )
        }
    };
}

function insertFragmentAtRange(
    opts: Options,
    change: Change,
    range: Range,
    fragment: Document,
    insertOptions: { normalize: boolean }
): Change {
    deleteAtRange(opts, change, range, { normalize: false });
    const nextRange = change.value.document.getDescendant(range.endKey)
        ? range
        : range.collapseToStart();
    bindRules(insertFragmentRules, 0, opts, change, nextRange, fragment);
    if (insertOptions.normalize) {
        change.normalize();
    }
    return change;
}

export default makePatch;
export { insertFragmentAtRange };
