// @flow
import type Options from '../options';

function createSchema(opts: Options): Object {
    const { typeBadCell, typeBadTable, typeBadRow } = opts;
    const {
        typeParagraph,
        typeImage,
        typeHeading,
        typeTable,
        typeUList,
        typeOList
    } = opts;
    return {
        [typeBadTable]: {
            nodes: [{ kinds: ['block'], types: [typeBadRow] }],
            parent: { kinds: ['document'] }
        },
        [typeBadRow]: {
            nodes: [{ kinds: ['block'], types: [typeBadCell] }],
            parent: { types: [typeBadTable] }
        },
        [typeBadCell]: {
            nodes: [
                {
                    kinds: ['block'],
                    types: [
                        typeParagraph,
                        typeImage,
                        typeHeading,
                        typeTable,
                        typeUList,
                        typeOList
                    ]
                }
            ],
            parent: { types: [typeBadRow] }
        }
    };
}

export default createSchema;
