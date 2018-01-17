// @flow
import { type Node, type Change } from 'slate';
import type Options from '../options';

function validateNode(opts: Options, node: Node): (Change => Change) | void {
    if (node.object !== 'block' || node.type !== opts.typeBadTable) {
        return undefined;
    }
    const rows = node.nodes;
    const isAllParagraphs = rows.every(row =>
        row.nodes.every(cell => {
            const allP = cell.nodes.every(n => n.type === opts.typeParagraph);
            if (opts.isMultiLineEditTable) {
                return allP;
            }
            return allP && cell.nodes.size === 1;
        })
    );
    if (!isAllParagraphs) {
        return undefined;
    }

    const firstWidth = rows.first().nodes.size;
    const isAllSameWidth = rows.every(row => row.nodes.size === firstWidth);
    if (!isAllSameWidth) {
        return undefined;
    }
    return change => {
        node.nodes.forEach(row => {
            row.nodes.forEach(cell => {
                change.setNodeByKey(cell.key, opts.typeCell, {
                    normalize: false
                });
                const texts = cell.getTexts();
                texts.forEach(text => {
                    change.unwrapNodeByKey(text.key, { normalize: false });
                    if (text !== texts.last()) {
                        change.insertTextByKey(
                            text.key,
                            text.text.length,
                            '\n'
                        );
                    }
                    return true;
                });
                return true;
            });
            change.setNodeByKey(row.key, opts.typeRow, { normalize: false });
            return true;
        });
        change.setNodeByKey(node.key, opts.typeTable);
    };
}
export default validateNode;
