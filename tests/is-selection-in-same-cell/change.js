import expect from 'expect';

export default function(plugin, change) {
    const { isSelectionInCell } = plugin.utils;
    const { document } = change.value;
    const focusBlock = document.getDescendant('_focus_');
    const anchorBlock = document.getDescendant('_anchor_');

    change.moveToRangeOf(focusBlock).extendToStartOf(anchorBlock);
    expect(isSelectionInCell(change.value)).toEqual(true);
    change.extendToStartOf(document.getDescendant('_anchor_another_cell_'));
    expect(isSelectionInCell(change.value)).toEqual(false);
    change.extendToStartOf(document.getDescendant('_before_'));
    expect(isSelectionInCell(change.value)).toEqual(false);

    return change;
}
