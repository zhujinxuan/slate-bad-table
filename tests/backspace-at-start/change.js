import expect from 'expect';

export default function(plugin, change) {
    const { value } = change;
    const focusBlock = value.document.getDescendant('_focus_');

    change.collapseToStartOf(focusBlock);

    const operationResult = plugin.onKeyDown(
        { key: 'backspace', which: 8 },
        change
    );

    expect(!!operationResult).toEqual(true);
    expect(change.value.startBlock.key).toEqual('_focus_after_');

    return change;
}
