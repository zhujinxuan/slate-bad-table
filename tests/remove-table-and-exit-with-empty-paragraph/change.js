import expect from 'expect';

export default function(plugin, change) {
    const cursorBlock = change.value.document.getDescendant('_cursor_');
    change.moveToRangeOf(cursorBlock);

    plugin.changes.removeTable(change);
    const { startBlock, endBlock } = change.value;
    expect(startBlock).toEqual(endBlock);
    expect(startBlock).toEqual(change.value.document.nodes.first());
    return change;
}
