// @flow
import { getFragmentAtRange as plugin } from 'slate-bind-copy-paste';
import { type Change, type Range, type Document } from 'slate';
import { type typeRule } from './type';
import type Options from '../../options';
import ifInSameCell from './ifInSameCell';
import ifEndInCell from './ifEndInCell';
import ifStartInCell from './ifStartInCell';

function makeRules(opts): Array<typeRule> {
    return [ifStartInCell(opts), ifEndInCell(opts), ifInSameCell(opts)];
}

type typePatch = {
    rules: {
        getFragmentAtRange: Array<typeRule>
    },
    utils: { getFragmentAtRange: (Node, Range) => Document }
};

function makePatch(opts: Options): typePatch {
    const rules = makeRules(opts);
    return {
        rules: {
            getFragmentAtRange: rules
        },
        utils: {
            getFragmentAtRange: plugin.generate(rules)
        }
    };
}
function getFragmentAtRange(opts: Options): (Change, Range) => Document {
    return plugin.generate(makeRules(opts));
}

export default makePatch;
export { getFragmentAtRange };
