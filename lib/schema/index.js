// @flow
import type Options from '../options';

function createSchema(opts: Options): Object {
    const { typeBadCell, typeBadTable, typeBadRow } = opts;
    return {
        [typeBadTable]: {
            nodes: [{ objects: ['block'], types: [typeBadRow] }],
            parent: { objects: ['document'] }
        },
        [typeBadRow]: {
            nodes: [{ objects: ['block'], types: [typeBadCell] }],
            parent: { types: [typeBadTable] }
        },
        [typeBadCell]: {
            parent: { types: [typeBadRow] }
        }
    };
}

export default createSchema;
