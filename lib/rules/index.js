// @flow
import { type Change, type Node, type Range } from 'slate';
import type Options from '../options';
import createPatchGetFragmentAtRange from './getFragmentAtRange/index';
import createPatchDeleteAtRange from './deleteAtRange/index';

type typePatch = {
    utils: {
        getFragmentAtRange: (Node, Range) => Document
    },
    changes: {
        deleteAtRange: (Change, Range, Object) => Change
    },
    rules: {
        getFragmentAtRange: Array<
            ((Node, Range) => Document, Node, Range, () => Document) => Document
        >,
        deleteAtRange: Array<
            ((Change, Range) => Range, Change, Range, () => Change) => Change
        >
    }
};

function createPatch(opts: Options): typePatch {
    const patchGetFragmentAtRange = createPatchGetFragmentAtRange(opts);
    const patchDeleteAtRange = createPatchDeleteAtRange(opts);
    return {
        utils: patchGetFragmentAtRange.utils,
        changes: patchDeleteAtRange.changes,
        rules: { ...patchGetFragmentAtRange.rules, ...patchDeleteAtRange.rules }
    };
}

export default createPatch;
