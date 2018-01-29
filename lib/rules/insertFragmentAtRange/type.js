// @flow
import { type Change, type Range, type Document } from 'slate';

export type typeInsertOptions = {
    normalize: boolean,
    lastNodeAsText: boolean,
    firstNodeAsText: boolean,
    snapshotSelection: boolean,
    [string]: *
};
export type typeRule = (
    (Change, Range, Document, typeInsertOptions) => Change,
    Change,
    Range,
    Document,
    typeInsertOptions,
    (typeInsertOptions) => Change
) => Change;
