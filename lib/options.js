// @flow

import { Record } from 'immutable';

export type OptionsFormat = {
    typeTable?: string,
    typeRow?: string,
    typeCell?: string,
    typeBadTable?: string,
    typeBadRow?: string,
    typeBadCell?: string,
    typeParagraph?: string,
    typeImage?: string,
    typeHeading?: string,
    typeUList?: string,
    typeOList?: string,
    exitBlockType?: string
};

/**
 * The plugin options
 */
class Options extends Record({
    typeTable: 'table',
    typeRow: 'table_row',
    typeCell: 'table_cell',
    typeBadTable: 'bad-table',
    typeBadRow: 'bad-table-row',
    typeBadCell: 'bad-table-cell',
    typeParagraph: 'paragraph',
    typeImage: 'image',
    typeHeading: 'heading',
    typeUList: 'ul_list',
    typeOList: 'ol_list',
    exitBlockType: 'paragraph'
}) {
    // The type of table blocks
    typeTable: string;
    // The type of row blocks
    typeRow: string;
    // The type of cell blocks
    typeCell: string;
    // The type of block inserted when exiting
    exitBlockType: string;

    // Bad Table
    typeBadTable: string;
    typeBadCell: string;
    typeBadRow: string;

    //
    typeParagraph: string;
    typeImage: string;
    typeHeading: string;
    typeUList: string;
    typeOList: string;
}

export default Options;
