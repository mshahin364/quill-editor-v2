import emojiMap from "../quill-emoji/EmojiMap";
// import Quill from 'quill';
import Base from 'quill/blots/embed';

// const Base = Quill.import('blots/embed');

class EmojiBlot extends Base {
    static emojiClass: string;
    static emojiPrefix: string;

    static create(value: any) {
        const node = super.create();
        if (typeof value === 'object') {

            EmojiBlot.buildSpan(value, node);
        } else if (typeof value === "string") {
            const valueObj = emojiMap[value];

            if (valueObj) {
                EmojiBlot.buildSpan(valueObj, node);
            }
        }

        return node;
    }

    static value(node: any) {
        return node.dataset.name;
    }

    static buildSpan(value: any, node: any) {
        node.setAttribute('data-name', value.name);
        const emojiSpan = document.createElement('span');
        emojiSpan.classList.add(this.emojiClass);
        emojiSpan.classList.add(this.emojiPrefix + value.name);
        // unicode can be '1f1f5-1f1ea',see emoji-list.js.
        emojiSpan.innerText = String.fromCodePoint(...EmojiBlot.parseUnicode(value.unicode));
        node.appendChild(emojiSpan);
    }
    static parseUnicode(unicode: string) {
        return unicode.split('-').map(str => parseInt(str, 16));
    }
}

EmojiBlot.blotName = 'emoji';
EmojiBlot.className = 'ql-emojiblot';
EmojiBlot.tagName = 'span';
EmojiBlot.emojiClass = 'ap';
EmojiBlot.emojiPrefix = 'ap-';

export default EmojiBlot;