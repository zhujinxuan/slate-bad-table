// @flow
import { insertFragmentAtRange as plugin } from 'slate-bind-copy-paste';
import { type Change, type Range, type Document } from 'slate';
import type Options from '../../options';
import { type typeRule } from './type';

import splitTableAtRangeStart from './split-table-at-range-start';
import splitTableAtRangeEnd from './split-table-at-range-end';
import appendTableAtRangeEnd from './append-table-at-range-end';
import appendTableAtRangeStart from './append-table-at-range-start';

import { deleteAtRange } from '../deleteAtRange/index';

const {
    firstParagraphAsText,
    lastParagraphAsText,
    nodesAsBlocks
} = plugin.rules;

function makeRules(opts: Options): Array<typeRule> {
    return [
        splitTableAtRangeStart(opts),
        splitTableAtRangeEnd(opts),
        appendTableAtRangeStart(opts),
        appendTableAtRangeEnd(opts),
        firstParagraphAsText,
        lastParagraphAsText,
        nodesAsBlocks
    ];
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
    const rules = makeRules(opts);
    return {
        rules: {
            insertFragmentAtRange: rules
        },
        changes: {
            insertFragmentAtRange: plugin.generate(rules, {
                deleteAtRange: deleteAtRange(opts)
            })
        }
    };
}

function insertFragmentAtRange(opts: Options) {
    const rules = makeRules(opts);
    return plugin.generate(rules);
}
export default makePatch;
export { insertFragmentAtRange };
