// @flow
import { type Change } from 'slate';
import type Options from '../options';
import removeTable from './removeTable';
import insertColumn from './insertColumn';
import insertRow from './insertRow';
import removeColumn from './removeColumn';
import removeRow from './removeRow';

type typeChanges = {
    removeTable: Change => Change,
    insertColumn: Change => Change,
    insertRow: Change => Change,
    removeRow: Change => Change,
    removeColumn: Change => Change
};

function makeChanges(opts: Options): typeChanges {
    return {
        removeTable: removeTable(opts),
        removeColumn: removeColumn(opts),
        removeRow: removeRow(opts),
        insertRow: insertRow(opts),
        insertColumn: insertColumn(opts)
    };
}

export default makeChanges;
