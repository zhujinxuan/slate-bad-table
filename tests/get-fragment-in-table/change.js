// import expect from 'expect';
import { Range } from 'slate';

export default function(plugin, change) {
    const { document } = change.value;
    const anchorBlock = document.getDescendant('_anchor_');
    const focusBlock = document.getDescendant('_focus_');
    const range = Range.create()
        .moveAnchorToStartOf(anchorBlock)
        .moveFocusToStartOf(focusBlock);
    const fragment = plugin.utils.getFragmentAtRange(document, range);
    document.nodes.forEach((block, index) => {
        change.removeNodeByKey(block.key);
    });
    fragment.nodes.forEach((block, index) => {
        const key = change.value.document.key;
        change.insertNodeByKey(key, index, block);
    });

    return change;
}
