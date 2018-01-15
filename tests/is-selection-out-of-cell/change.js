import expect from 'expect';

export default function(plugin, change) {
    const { isSelectionOutOfCell } = plugin.utils;
    const { document } = change.value;
    const focusBlock = document.getDescendant('_focus_');
    const anchorBlock = document.getDescendant('_anchor_');

    change.moveToRangeOf(focusBlock).extendToStartOf(anchorBlock);
    expect(isSelectionOutOfCell(change.value)).toEqual(false);
    change.extendToStartOf(document.getDescendant('_anchor_another_cell_'));
    expect(isSelectionOutOfCell(change.value)).toEqual(false);
    change.extendToStartOf(document.getDescendant('_before_'));
    expect(isSelectionOutOfCell(change.value)).toEqual(false);
    change
        .moveToRangeOf(document.getDescendant('_before_'))
        .extendToEndOf(document.getDescendant('_after_'));
    expect(isSelectionOutOfCell(change.value)).toEqual(true);

    return change;
}
