// @flow
import { deleteAtRange as plugin } from 'slate-bind-copy-paste';
import { type Change, type Range, type Object } from 'slate';
import type Options from '../../options';
import { type typeRule } from './type';
import ifStartInCell from './ifStartInCell';
import ifEndInCell from './ifEndInCell';
import ifInSameCell from './ifInSameCell';

const { atDifferentText, atSameText } = plugin.rules;
function makeRules(opts: Options): Array<typeRule> {
    return [
        ifStartInCell(opts),
        ifEndInCell(opts),
        ifInSameCell(opts),
        atDifferentText,
        atSameText
    ];
}

type typePatch = {
    rules: {
        deleteAtRange: Array<typeRule>
    },
    changes: { deleteAtRange: (Change, Range, Object) => Change }
};

function makePatch(opts: Options): typePatch {
    const rules = makeRules(opts);
    return {
        rules: {
            deleteAtRange: rules
        },
        changes: {
            deleteAtRange: plugin.generate(rules)
        }
    };
}

function deleteAtRange(opts: Options): (Change, Range, Object) => Change {
    return plugin.generate(makeRules(opts));
}

export default makePatch;
export { deleteAtRange };
