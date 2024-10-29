import Quill from 'quill';
import Fuse from 'fuse.js';
import emojiList from '../../quill-emoji/EmojiList';

const Module = Quill.import('core/module');

class TextAreaEmoji extends Module {
    container: HTMLDivElement;

    constructor(quill: Quill, options: { buttonIcon: string }) {
        super(quill, options);

        this.quill = quill;
        this.container = document.createElement('div');
        this.container.classList.add('textarea-emoji-control');
        this.container.style.position = 'absolute';
        this.container.innerHTML = options.buttonIcon;
        this.quill.container.appendChild(this.container);
        this.container.addEventListener('click', this.checkEmojiBoxExist.bind(this), false);
    }

    checkEmojiBoxExist() {
        const elementExists = document.getElementById('textarea-emoji');
        if (elementExists) {
            elementExists.remove();
        } else {
            const emojiArea = document.createElement('div');
            emojiArea.id = 'textarea-emoji';
            this.quill.container.appendChild(emojiArea);
            const tabToolbar = document.createElement('div');
            tabToolbar.id = 'tab-toolbar';
            emojiArea.appendChild(tabToolbar);

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
            const panel = document.createElement('div');
            panel.id = 'tab-panel';
            emojiArea.appendChild(panel);
            const innerQuill = this.quill;
            emojiType.map((emoji) => {
                const tabElement = document.createElement('li');
                tabElement.classList.add('emoji-tab');
                tabElement.classList.add('filter-' + emoji.name);
                tabElement.innerHTML = emoji.content;
                tabElement.dataset.filter = emoji.type;
                tabElementHolder.appendChild(tabElement);
                const emojiFilter = document.querySelector('.filter-' + emoji.name) as HTMLLIElement;
                emojiFilter?.addEventListener('click', () => {
                    const emojiContainer = document.getElementById('textarea-emoji');
                    const tab = emojiContainer && emojiContainer.querySelector('.active');

                    if (tab) {
                        tab.classList.remove('active');
                    }

                    emojiFilter?.classList.toggle('active');

                    while (panel.firstChild) {
                        panel.removeChild(panel.firstChild);
                    }

                    const type = emojiFilter?.dataset.filter;
                    fn_emojiElementsToPanel(type, panel, innerQuill);
                });
            });

            const windowHeight = window.innerHeight;
            const editorPos = this.quill.container.getBoundingClientRect().top;
            if (editorPos > windowHeight / 2) {
                emojiArea.style.top = '-250px';
            }
            fn_emojiPanelInit(panel, this.quill);
        }
    }
}

TextAreaEmoji.DEFAULTS = {
    buttonIcon: '<svg viewbox="0 0 18 18"><circle class="ql-fill" cx="7" cy="7" r="1"></circle><circle class="ql-fill" cx="11" cy="7" r="1"></circle><path class="ql-stroke" d="M7,10a2,2,0,0,0,4,0H7Z"></path><circle class="ql-stroke" cx="9" cy="9" r="6"></circle></svg>'
};

function fn_close() {
    const emojiPlate = document.getElementById('textarea-emoji');
    const emojiCloseDiv = document.getElementById('emoji-close-div');
    if (emojiCloseDiv) {
        emojiCloseDiv.style.display = 'none';
    }
    if (emojiPlate) {
        emojiPlate.remove();
    }
}

function fn_updateRange(quill: Quill) {
    // quill.enable();
    // quill.focus({preventScroll: false});
    return quill.getSelection();
}

function fn_emojiPanelInit(panel: any, quill: Quill) {
    fn_emojiElementsToPanel('p', panel, quill);
    const filterPeople = document.querySelector('.light-theme');
    filterPeople?.classList.add('active');
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

    // setTimeout(() => quill.focus({preventScroll: false}), 0);

    quill.focus();
    const range = fn_updateRange(quill);

    result.map((fuseEmoji) => {
        const emoji = fuseEmoji.item;
        const span = document.createElement('span');
        const textNode = document.createTextNode(emoji.shortname);
        span.appendChild(textNode);
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
                if (range) {
                    quill.insertEmbed(range.index, 'emoji', emoji, 'user');
                    setTimeout(() => range && quill.setSelection({index: range.index + 1, length: range.length}), 0);
                }
                fn_close();
            });
        }
    });
}

export default TextAreaEmoji;