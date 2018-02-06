// import expect from 'expect';
import { Range } from 'slate';

export default function(plugin, change) {
    const { document } = change.value;
    const fragmentAnchorBlock = document.getDescendant('_get_fragment_anchor_');
    const fragmentFocusBlock = document.getDescendant('_get_fragment_focus_');
    const range = Range.create()
        .moveAnchorToStartOf(fragmentAnchorBlock)
        .moveAnchor(2)
        .moveFocusToStartOf(fragmentFocusBlock)
        .moveFocus(2);
    const fragment = plugin.utils.getFragmentAtRange(document, range);

    const anchorBlock = document.getDescendant('_anchor_');
    const focusBlock = document.getDescendant('_focus_');
    const nextRange = range
        .moveAnchorToStartOf(anchorBlock)
        .moveAnchor(1)
        .moveFocusToStartOf(focusBlock)
        .moveFocus(1);
    plugin.changes.insertFragmentAtRange(change, nextRange, fragment);

    return change;
}
