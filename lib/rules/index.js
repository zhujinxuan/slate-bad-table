// @flow
import { type Node, type Range } from 'slate';
import type Options from '../options';
import patchGetFragmentAtRange from './getFragmentAtRange/index';

type typePatch = {
    utils: {
        getFragmentAtRange: (Node, Range) => Document
    },
    rules: {
        getFragmentAtRange: Array<
            ((Node, Range) => Document, Node, Range, () => Document) => Document
        >
    }
};

function createPatch(opts: Options): typePatch {
    return patchGetFragmentAtRange(opts);
}

export default createPatch;
