// @flow
import { insertFragmentAtRange as plugin } from 'slate-bind-copy-paste';
import { type Change, type Range, type Document } from 'slate';
import type Options from '../../options';
import { type typeRule } from './type';
import insertImageAtStart from './if-start-in-table-and-image-at-start';
import insertImageAtEnd from './if-end-in-table-and-image-at-end';
import { deleteAtRange } from '../deleteAtRange/index';

const {
    firstParagraphAsText,
    lastParagraphAsText,
    nodesAsBlocks
} = plugin.rules;

function makeRules(opts: Options): Array<typeRule> {
    const insertImageAtTableStart = insertImageAtStart(opts);
    const insertImageAtTableEnd = insertImageAtEnd(opts);
    return [
        insertImageAtTableStart,
        insertImageAtTableEnd,
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
