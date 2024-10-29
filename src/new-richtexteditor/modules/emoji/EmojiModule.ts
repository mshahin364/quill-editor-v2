// import Quill, {RangeStatic, Sources} from 'quill';
// import Quill, { type EmitterSource, type Range as RangeStatic } from 'quill';
import { type EmitterSource, type Range as RangeStatic } from 'quill';
import Fuse, {FuseResult} from 'fuse.js';
import emojiList, {Emoji} from '../../quill-emoji/EmojiList';
import type DeltaStatic from 'quill-delta';
import  Module from 'quill/core/module';

// const Module = Quill.import('core/module');

class EmojiModule extends Module {
    emojiList: Emoji[];
    fuse: Fuse<Emoji>;
    onClose: any;
    onOpen: any;
    container: HTMLUListElement;
    onSelectionChange: () => void;
    onTextChange: (delta: DeltaStatic, oldContents: DeltaStatic, source: EmitterSource) => void;
    open: boolean;
    atIndex: number | null;
    focusedButton: number | null;
    isWhiteSpace: (ch: string) => boolean;
    buttons: HTMLButtonElement[];
    query: string;
    event: any;

    constructor(quill: any, options: { emojiList: Emoji[], fuse: any, onClose: any, onOpen: any }) {
        super(quill, options);

        this.emojiList = options.emojiList;
        this.fuse = new Fuse(options.emojiList, options.fuse);

        this.quill = quill;
        this.onClose = options.onClose;
        this.onOpen = options.onOpen;
        this.container = document.createElement('ul');
        this.container.classList.add('emoji_completions');
        this.quill.container.appendChild(this.container);
        this.container.style.position = 'absolute';
        this.container.style.display = 'none';
        this.buttons = [];
        this.query = '';

        this.onSelectionChange = this.onSelectionChangeHandler.bind(this);
        this.onTextChange = this.onTextChangedHandler.bind(this);

        this.open = false;
        this.atIndex = null;
        this.focusedButton = null;

        this.isWhiteSpace = (ch: string) => (/^\s*$/.test(ch));

        quill.keyboard.addBinding({
            key: 186,
            shiftKey: true
        }, this.triggerPicker.bind(this));

        quill.keyboard.addBinding({
            key: 59,
            shiftKey: true
        }, this.triggerPicker.bind(this));

        quill.keyboard.addBinding({
            key: 39,  // ArrowRight
        }, this.handleArrow.bind(this));

        quill.keyboard.addBinding({
            key: 40,  // ArrowRight
        }, this.handleArrow.bind(this));

        quill.keyboard.addBinding({
            key: 27,  // ArrowRight
        }, this.handleEscape.bind(this));
    }

    triggerPicker(range: RangeStatic, _context: any) {
        console.log("=>(EmojiModule.ts:78) triggerPicker", this.open);
        if (range.index > 0) {
            const lastChar = this.quill.getText(range.index - 1, 1).replace(/\n$/, '');
            if (!this.isWhiteSpace(lastChar)) {
                return true;
            }
        }

        if (this.open) return true;
        if (range.length > 0) {
            this.quill.deleteText(range.index, range.length, 'user');
        }

        this.quill.insertText(range.index, ':', 'emoji-shortname', 'user');
        const atSignBounds = this.quill.getBounds(range.index);
        this.quill.setSelection(range.index + 1, 'user');

        this.atIndex = range.index;

        if(atSignBounds) {
            const paletteMaxPos = atSignBounds.left + 250;
            if (paletteMaxPos > this.quill.container.offsetWidth) {
                this.container.style.left = (atSignBounds.left - 250) + 'px';
            } else {
                this.container.style.left = atSignBounds.left + 'px';
            }

            this.container.style.top = atSignBounds.top + atSignBounds.height + 'px';
        }
        this.open = true;

        this.quill.on('text-change', this.onTextChange);
        this.quill.once('selection-change', this.onSelectionChange);
        if (this.onOpen) {
            this.onOpen();
            return;
        }
        return;
    }

    handleEscape() {
        this.open = false;
        this.close();
    }

    handleArrow() {
        if (!this.open) return true;
        this.buttons[0].classList.remove('emoji-active');
        this.buttons[0].focus();
        if (this.buttons.length > 1) {
            this.buttons[1].focus();
            return;
        }
        return;
    }

    onTextChangedHandler(delta: DeltaStatic, _oldContents: DeltaStatic, _source: EmitterSource) {
        // const text = this.quill.getText();
        // const lastWhitespaceIndex = text.lastIndexOf(' ', this.quill?.getSelection()?.index);
        // console.log("=>(EmojiModule.ts:137) lastWhitespaceIndex", lastWhitespaceIndex);
        // const findColon = text.lastIndexOf(':', this.quill?.getSelection()?.index);
        // console.log("=>(EmojiModule.ts:138) findColon", findColon);
        // const findSpace2 = text.charAt(findColon -2);
        // console.log("=>(EmojiModule.ts:140) findSpace2", findSpace2);
        // const findSpace = text.charAt(findColon -1);
        // console.log("=>(EmojiModule.ts:140) findSpace", findSpace);
        //     const continueExecution = findColon > -1 && findSpace === ' ';
        // if(!continueExecution && findColon !== 0) {
        //     return;
        // }


        // const text = this.quill.getText();
        // const findColon = text.lastIndexOf(':', this.quill?.getSelection()?.index);
        // // const lastWhitespaceIndex = text.lastIndexOf(' ', this.quill?.getSelection()?.index);
        // const findSpace = text.charAt(findColon -1);
        // const continueExecution = findColon > -1 && findSpace === ' ';
        // if(!continueExecution && findColon !== 0) {
        //     return;
        // }


        const sel = this.quill?.getSelection()?.index;
        if(this.atIndex !== null && sel !== undefined) {
            if (this.atIndex >= sel) { // Deleted the at character
                return this.close();
            }
            // Using: fuse.js
            this.query = this.quill.getText(this.atIndex + 1, sel - this.atIndex - 1);
        }


        try {
            if (this.event && this.isWhiteSpace(this.query)) {
                this.close();
                return;
            }
        } catch (e) {
            // error happened
        }

        this.query = this.query.trim();

        let emojiResults: FuseResult<Emoji>[] = this.fuse.search(this.query);
        emojiResults.sort((a, b) => {
            return Number(a.item.emoji_order) - Number(b.item.emoji_order);
        });

        if (this.query.length < (this.options as any).fuse.minMatchCharLength || emojiResults.length === 0) {
            this.open = false;
            this.container.style.display = 'none';
            return;
        }
        if (emojiResults.length > 15) {
            // return only 15
            emojiResults = emojiResults.slice(0, 15);
        }

        const emojis = emojiResults.map(result => result.item);
        if(emojis.length > 0) {
            this.open = true;
            this.renderCompletions(emojis, delta);
        } else {
            this.container.style.display = 'none';
            this.open = false;
        }
        return;
    }

    onSelectionChangeHandler() {
        if (this.container.querySelector('*:focus')) return;
        this.close(null);
    }

    renderCompletions(emojis: Emoji[], delta: DeltaStatic) {
        try {
            if (delta.ops?.[1]?.insert === '\n') {
                this.close(emojis[0], 1);
                this.container.style.display = 'none';
                return;
            }
        } catch (e) {
            // error happened
        }

        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        const buttons = Array(emojis.length);
        this.buttons = buttons;

        const handler = (event: KeyboardEvent, index: number, emoji: Emoji) => {
            if (event.key === 'ArrowRight' || event.keyCode === 39) {
                event.preventDefault();
                buttons[Math.min(buttons.length - 1, index + 1)].focus();
            } else if (event.key === 'Tab' || event.keyCode === 9) {
                event.preventDefault();
                if ((index + 1) === buttons.length) {
                    buttons[0].focus();
                    return;
                }
                buttons[Math.min(buttons.length - 1, index + 1)].focus();
            } else if (event.key === 'ArrowLeft' || event.keyCode === 37) {
                event.preventDefault();
                buttons[Math.max(0, index - 1)].focus();
            } else if (event.key === 'ArrowDown' || event.keyCode === 40) {
                event.preventDefault();
                buttons[Math.min(buttons.length - 1, index + 1)].focus();
            } else if (event.key === 'ArrowUp' || event.keyCode === 38) {
                event.preventDefault();
                buttons[Math.max(0, index - 1)].focus();
            } else if (event.key === 'Enter' || event.keyCode === 13
                || event.key === ' ' || event.keyCode === 32
                || event.key === 'Tab' || event.keyCode === 9) {
                event.preventDefault();
                this.quill.enable();
                this.close(emoji);
            }
        };

        emojis.forEach((emoji, i) => {
            const li = makeElement(
                'li', {},
                makeElement(
                    'button', {type: 'button'},
                    makeElement('span', {className: 'button-emoji ap ap-' + emoji.name, innerHTML: emoji.code_decimal}),
                    makeElement('span', {className: 'unmatched'}, emoji.shortname)
                )
            );
            this.container.appendChild(li);
            buttons[i] = li.firstChild;
            // Events will be GC-ed with button on each re-render:
            buttons[i].addEventListener('keydown', (e: KeyboardEvent) => handler(e, i, emoji));
            buttons[i].addEventListener('mousedown', () => this.close(emoji));
            buttons[i].addEventListener('focus', () => this.focusedButton = i);
            buttons[i].addEventListener('unfocus', () => this.focusedButton = null);
        });

        this.container.style.display = 'block';
        // emoji palette on top
        if (this.quill.container.classList.contains('top-emoji')) {
            const x = this.container.querySelectorAll('li');
            let i;
            for (i = 0; i < x.length; i++) {
                x[i].style.display = 'block';
            }

            const windowHeight = window.innerHeight;
            const editorPos = this.quill.container.getBoundingClientRect().top;
            if (editorPos > windowHeight / 2 && this.container.offsetHeight > 0) {
                this.container.style.top = '-' + this.container.offsetHeight + 'px';
            }
        }

        buttons[0].classList.add('emoji-active');

        //Escape key to close emoji palette
        this.container.addEventListener('keydown', (event: KeyboardEvent) => {
            if(event.key === "Escape") {
                // this.open = false;
                // // this.close();
                // // this.atIndex = null;
                this.quill.focus()
                this.container.style.display = 'none';
            }

        })


    }

    close(value?: Emoji | null, trailingDelete = 0) {
        this.quill.enable();
        this.container.style.display = 'none';
        while (this.container.firstChild) this.container.removeChild(this.container.firstChild);
        // this.quill.off('selection-change', this.onSelectionChange);
        // this.quill.off('text-change', this.onTextChange);
        // if (value &&  this.atIndex !== null && this.atIndex >= 0) {
        if (value) {
            this.quill.deleteText(this.atIndex!, this.query.length + 1 + trailingDelete, 'user');
            this.quill.insertEmbed(this.atIndex!, 'emoji', value, 'user');

            this.quill.off('selection-change', this.onSelectionChange);
            this.quill.off('text-change', this.onTextChange);
            this.open = false;


            setTimeout(() => {

                this.quill.setSelection(this.atIndex! + 1);
            }, 0);
            return;
        }
        this.quill.focus();
        // this.open = false;
        if (this.onClose) {
            this.onClose(value);
            return;
        }
        return;
    }
}

EmojiModule.DEFAULTS = {
    emojiList: {emojiList},
    fuse: {
        shouldSort: true,
        threshold: 0.1,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
            'shortname'
        ]
    }
};

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

export default EmojiModule;