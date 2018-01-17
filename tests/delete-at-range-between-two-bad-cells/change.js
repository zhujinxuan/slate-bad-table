// import expect from 'expect';
import { Range } from 'slate';

export default function(plugin, change) {
    const { document } = change.value;
    const anchorBlock = document.getDescendant('_anchor_');
    const focusBlock = document.getDescendant('_focus_');
    plugin.changes.deleteAtRange(
        change,
        Range.create()
            .moveAnchorToEndOf(anchorBlock)
            .moveFocusToStartOf(focusBlock)
            .moveFocus(1)
    );
    return change;
}
