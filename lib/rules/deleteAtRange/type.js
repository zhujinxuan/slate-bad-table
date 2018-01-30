// @flow
import { type Change, type Range } from 'slate';

export type typeRemoveOptions = {
    deleteStartText: boolean,
    deleteEndText: boolean,
    snapshot: boolean,
    normalize: boolean
};
export type typeRule = (
    (Change, Range, typeRemoveOptions) => Change,
    Change,
    Range,
    typeRemoveOptions,
    (typeRemoveOptions) => Change
) => Change;
