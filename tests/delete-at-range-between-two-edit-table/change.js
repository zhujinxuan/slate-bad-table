// import expect from 'expect';
import { Range } from 'slate';

export default function(plugin, change) {
    const { document } = change.value;
    const anchorBlock = document.getDescendant('_anchor_');
    const focusBlock = document.getDescendant('_focus_');
    change.collapseToStartOf(anchorBlock).extendToEndOf(focusBlock);
    plugin.changes.deleteAtRange(
        change,
        change.value.selection,
        { normalize: false }
    );
    return change;
}
