// @flow
import { type Change, type Node, type Range, type Document } from 'slate';
import type Options from '../options';
import createPatchGetFragmentAtRange from './getFragmentAtRange/index';
import createPatchDeleteAtRange from './deleteAtRange/index';
import createPatchInsert from './insertFragmentAtRange/index';

type typePatch = {
    utils: {
        getFragmentAtRange: (Node, Range) => Document
    },
    changes: {
        deleteAtRange: (Change, Range, Object) => Change,
        insertFragmentAtRange: (Change, Range, Document, Object) => Change
    },
    rules: {
        getFragmentAtRange: Array<
            ((Node, Range) => Document, Node, Range, () => Document) => Document
        >,
        deleteAtRange: Array<
            ((Change, Range) => Range, Change, Range, () => Change) => Change
        >,
        insertFragmentAtRange: Array<
            (
                (Change, Range, Document) => Change,
                Change,
                Range,
                Document,
                () => Change
            ) => Change
        >
    }
};

function createPatch(opts: Options): typePatch {
    const patchGetFragmentAtRange = createPatchGetFragmentAtRange(opts);
    const patchDeleteAtRange = createPatchDeleteAtRange(opts);
    const patchInsert = createPatchInsert(opts);
    return {
        utils: patchGetFragmentAtRange.utils,
        changes: { ...patchDeleteAtRange.changes, ...patchInsert.changes },
        rules: {
            ...patchGetFragmentAtRange.rules,
            ...patchDeleteAtRange.rules,
            ...patchInsert.rules
        }
    };
}

export default createPatch;
