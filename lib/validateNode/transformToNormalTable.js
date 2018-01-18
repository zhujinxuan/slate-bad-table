// @flow
import { type Node, type Change, Text } from 'slate';
import type Options from '../options';

function validateNode(opts: Options, node: Node): (Change => Change) | void {
    if (node.object !== 'block' || node.type !== opts.typeBadTable) {
        return undefined;
    }
    const rows = node.nodes;
    const isAllParagraphs = rows.every(row => {
        if (row.type !== opts.typeBadRow) {
            return false;
        }
        return row.nodes.every(cell => {
            if (cell.type !== opts.typeBadCell) {
                return false;
            }
            const allP = cell.nodes.every(n => n.type === opts.typeParagraph);
            if (opts.isMultiLineEditTable) {
                return allP;
            }
            return allP && cell.nodes.size === 1;
        });
    });
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
                transformParagraphs(change, cell);
                return true;
            });
            change.setNodeByKey(row.key, opts.typeRow, { normalize: false });
            return true;
        });
        change.setNodeByKey(node.key, opts.typeTable, { normalize: false });
    };
}

// An ugly fix before https://github.com/ianstormtaylor/slate/pull/1538
function transformParagraphs(change: Change, cell: Node): Change {
    let child = cell.nodes.find(c => c.object === 'block');

    const cellPath = change.value.document.getPath(cell.key);
    while (child) {
        cell = getParentAfterInsertLineBreak(change, child, cellPath);
        moveChildrenToParent(change, child.key, cell);
        cell = change.value.document.getNodeAtPath(cellPath);
        child = cell.nodes.find(c => c.object === 'block');
    }

    cell.nodes.reverse().forEach(textOrInline => {
        const index = cell.nodes.indexOf(textOrInline);
        if (textOrInline.object !== 'text') {
            return;
        }
        const nextNode = cell.nodes.get(index + 1);
        if (!nextNode) {
            return;
        }
        if (nextNode.object !== 'text') {
            return;
        }
        change.mergeNodeByKey(nextNode.key, { normalize: false });
    });
    return change;
}

function moveChildrenToParent(change: Change, key: string, parent: Parent) {
    const node = parent.getChild(key);
    const nodeIndex = parent.nodes.indexOf(node);
    node.nodes.forEach((child, index) => {
        change.moveNodeByKey(child.key, parent.key, index + nodeIndex, {
            normalize: false
        });
    });
    change.removeNodeByKey(node.key, { normalize: false });
}

function getParentAfterInsertLineBreak(
    change: Change,
    child: Block,
    parentPath: Array<number>
): Block {
    const parent = change.value.document.getNodeAtPath(parentPath);
    const childIndex = parent.nodes.indexOf(child);
    if (child === parent.nodes.last()) {
        return parent;
    }

    if (child.nodes.last().object === 'text') {
        const lastText = child.nodes.last();
        change.insertTextByKey(lastText.key, lastText.text.length, '\n', null, {
            normalize: false
        });
        return change.value.document.getNodeAtPath(parentPath);
    }
    const nextChild = parent.nodes.get(childIndex + 1);
    if (
        nextChild.object === 'block' &&
        nextChild.nodes.first().object === 'text'
    ) {
        change.insertTextByKey(nextChild.nodes.first().key, 0, '\n', null, {
            normalize: false
        });
        return change.value.document.getNodeAtPath(parentPath);
    }
    change.insertNodeByKey(parent.key, childIndex + 1, Text.create('\n'), {
        normalize: false
    });
    return change.value.document.getNodeAtPath(parentPath);
}

export default validateNode;
