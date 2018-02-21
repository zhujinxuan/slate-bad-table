import { createHyperscript } from 'slate-hyperscript';

/**
 * Define a hyperscript.
 *
 * @type {Function}
 */

const h = createHyperscript({
    blocks: {
        line: 'line',
        paragraph: 'paragraph',
        quote: 'quote',
        code: 'code',
        list: 'list',
        item: 'item',
        image: {
            type: 'image',
            isVoid: true
        },
        table: 'table',
        tr: 'table_row',
        td: 'table_cell',
        badTable: 'bad-table',
        badRow: 'bad-table-row',
        badCell: 'bad-table-cell'
    },
    inlines: {
        link: 'link',
        hashtag: 'hashtag',
        comment: 'comment',
        emoji: {
            type: 'emoji',
            isVoid: true
        }
    },
    marks: {
        b: 'bold',
        i: 'italic',
        u: 'underline'
    }
});

/**
 * Export.
 *
 * @type {Function}
 */

export default h;
