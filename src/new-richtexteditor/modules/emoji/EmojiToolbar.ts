import Quill from 'quill';
import Fuse from 'fuse.js';
import type DeltaStatic from 'quill-delta';
import emojiList from '../../quill-emoji/EmojiList';

const Module = Quill.import('core/module');

class ToolbarEmoji extends Module {
    toolbar: any;

    constructor(quill: Quill, options: { buttonIcon: string }) {
        super(quill, options);

        this.quill = quill;
        this.toolbar = quill.getModule('toolbar');
        if (typeof this.toolbar !== 'undefined')
            this.toolbar.addHandler('emoji', this.checkPaletteExists);

        const emojiBtns = document.getElementsByClassName('ql-emoji');
        if (emojiBtns) {
            Array.from(emojiBtns).forEach((emojiBtn) => {
                if (emojiBtn) {
                    emojiBtn.innerHTML = options.buttonIcon;
                }
            });
        }
    }

    checkPaletteExists() {
        const quill = this.quill;
        fn_checkDialogOpen(quill);
        this.quill.on('text-change', (_d: DeltaStatic, _o: DeltaStatic, source: string) => {
            if (source === 'user') {
                fn_close();
            }
        });
    }
}

ToolbarEmoji.DEFAULTS = {
    buttonIcon: '<svg viewbox="0 0 18 18"><circle class="ql-fill" cx="7" cy="7" r="1"></circle><circle class="ql-fill" cx="11" cy="7" r="1"></circle><path class="ql-stroke" d="M7,10a2,2,0,0,0,4,0H7Z"></path><circle class="ql-stroke" cx="9" cy="9" r="6"></circle></svg>'
};

function fn_close() {
    const emojiPlate = document.getElementById('emoji-palette');
    const emojiCloseDiv = document.getElementById('emoji-close-div');
    if (emojiCloseDiv) {
        emojiCloseDiv.style.display = 'none';
    }
    if (emojiPlate) {
        emojiPlate.remove();
    }
}

function fn_checkDialogOpen(quill: Quill) {
    const elementExists = document.getElementById('emoji-palette');
    if (elementExists) {
        elementExists.remove();
    } else {
        fn_showEmojiPalette(quill);
    }
}

function fn_showEmojiPalette(quill: any) {
    const paletteWidthAndHeight = 250;
    const emojiArea = document.createElement('div');
    const selection = quill.getSelection();
    const selectionBounds = quill.getBounds(selection.index);
    const editorBounds = quill.container.getBoundingClientRect();
    const selectionCenter = (selectionBounds.left + selectionBounds.right) / 2;
    const selectionMiddle = (selectionBounds.top + selectionBounds.bottom) / 2;
    const paletteLeft = editorBounds.left + selectionCenter + paletteWidthAndHeight <= document.documentElement.clientWidth ? selectionCenter : editorBounds.left - paletteWidthAndHeight;
    const paletteTop = editorBounds.top + selectionMiddle + paletteWidthAndHeight + 10 <= document.documentElement.clientHeight ? selectionMiddle + 10 :
        editorBounds.top + selectionMiddle - paletteWidthAndHeight - 10 >= 0 ? selectionMiddle - paletteWidthAndHeight - 10 :
            document.documentElement.clientHeight - paletteWidthAndHeight - editorBounds.top;

    quill.container.appendChild(emojiArea);
    emojiArea.id = 'emoji-palette';
    emojiArea.style.left = `${paletteLeft}px`;
    emojiArea.style.top = `${paletteTop}px`;

    const tabToolbar = document.createElement('div');
    tabToolbar.id = 'tab-toolbar';
    emojiArea.appendChild(tabToolbar);

    const panel = document.createElement('div');
    panel.id = 'tab-panel';
    emojiArea.appendChild(panel);

    const emojiType = [
        {'type': 'p', 'name': 'people', 'content': '<div class="i-people"></div>'},
        {'type': 'n', 'name': 'nature', 'content': '<div class="i-nature"></div>'},
        {'type': 'd', 'name': 'food', 'content': '<div class="i-food"></div>'},
        {'type': 's', 'name': 'symbols', 'content': '<div class="i-symbols"></div>'},
        {'type': 'a', 'name': 'activity', 'content': '<div class="i-activity"></div>'},
        {'type': 't', 'name': 'travel', 'content': '<div class="i-travel"></div>'},
        {'type': 'o', 'name': 'objects', 'content': '<div class="i-objects"></div>'},
        {'type': 'f', 'name': 'flags', 'content': '<div class="i-flags"></div>'}
    ];

    const tabElementHolder = document.createElement('ul');
    tabToolbar.appendChild(tabElementHolder);

    if (document.getElementById('emoji-close-div') === null) {
        const closeDiv = document.createElement('div');
        closeDiv.id = 'emoji-close-div';
        closeDiv.addEventListener('click', fn_close, false);
        document.getElementsByTagName('body')[0].appendChild(closeDiv);
    } else {
        const emojiCloseDiv = document.getElementById('emoji-close-div');
        if (emojiCloseDiv) {
            emojiCloseDiv.style.display = 'block';
        }
    }


    emojiType.forEach((emoji) => {
        const tabElement = document.createElement('li');
        tabElement.classList.add('emoji-tab');
        tabElement.classList.add('filter-' + emoji.name);
        tabElement.innerHTML = emoji.content;
        tabElement.dataset.filter = emoji.type;
        tabElementHolder.appendChild(tabElement);

        const emojiFilter = document.querySelector('.filter-' + emoji.name);
        emojiFilter?.addEventListener('click', () => {
            const tab = document.querySelector('.active');
            if (tab) {
                tab.classList.remove('active');
            }
            emojiFilter?.classList.toggle('active');
            fn_updateEmojiContainer(emojiFilter, panel, quill);
        });
    });
    fn_emojiPanelInit(panel, quill);
}

function fn_emojiPanelInit(panel: any, quill: Quill) {
    fn_emojiElementsToPanel('p', panel, quill);
    document.querySelector('.filter-people')?.classList.add('active');
}

function fn_emojiElementsToPanel(type: any, panel: any, quill: Quill) {
    const fuseOptions = {
        shouldSort: true,
        matchAllTokens: true,
        threshold: 0.3,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 3,
        keys: [
            'category'
        ]
    };
    const fuse = new Fuse(emojiList, fuseOptions);
    const result = fuse.search(type);
    result.sort((a, b) => {
        return Number(a.item.emoji_order) - Number(b.item.emoji_order);
    });

    quill.focus();
    const range = quill.getSelection();

    result.forEach((fuseEmoji) => {
        const emoji = fuseEmoji.item;
        const span = document.createElement('span');
        const t = document.createTextNode(emoji.shortname);
        span.appendChild(t);
        span.classList.add('bem');
        span.classList.add('bem-' + emoji.name);
        span.classList.add('ap');
        span.classList.add('ap-' + emoji.name);
        const output = '' + emoji.code_decimal + '';
        span.innerHTML = output + ' ';
        panel.appendChild(span);

        const customButton = document.querySelector('.bem-' + emoji.name);
        if (customButton) {
            customButton.addEventListener('click', () => {
                makeElement('span', {className: 'ico', innerHTML: '' + emoji.code_decimal + ' '});
                if (range) {
                    quill.insertEmbed(range.index, 'emoji', emoji, 'user');
                    setTimeout(() => range && quill.setSelection({index: range.index + 1, length: range.length}), 0);
                }
                fn_close();
            });
        }
    });
}

function fn_updateEmojiContainer(emojiFilter: any, panel: any, quill: Quill) {
    while (panel.firstChild) {
        panel.removeChild(panel.firstChild);
    }
    const type = emojiFilter.dataset.filter;
    fn_emojiElementsToPanel(type, panel, quill);
}

function makeElement(tag: any, attrs: any, ...children: any[]) {
    const elem = document.createElement(tag);
    Object.keys(attrs).forEach(key => elem[key] = attrs[key]);
    children.forEach(child => {
        if (typeof child === 'string')
            child = document.createTextNode(child);
        elem.appendChild(child);
    });
    return elem;
}

export default ToolbarEmoji;