import Quill from 'quill';

const IMAGE_PATTERN = /!\[(.*?)]\((.+?)\)/g;
const LINK_PATTERN = /\[(.+?)]\((.+?)\)/g;

type ActionParams = {
    text: string,
    selection: any,
    pattern: any,
    lineStart: any
}

export class MarkdownShortcutsModule {
    quill: Quill;
    options: any;
    ignoreTags: string[];
    matches: any[];

    constructor(quill: Quill, options?: any) {
        this.quill = quill;
        this.options = options;

        this.ignoreTags = [];
        this.matches = [
            {
                name: 'image',
                pattern: IMAGE_PATTERN,
                action: ({text, selection, pattern}: ActionParams) => {
                    const matchedAltText = (text.match(/\[(.*?)]/) || [])[0] || '';
                    const altText = matchedAltText.slice(1, matchedAltText.length - 1);
                    const startIndex = text.search(pattern);
                    const matchedText = (text.match(pattern) || [])[0] || '';
                    const hrefLink = (text.match(/\((.*?)\)/g) || [])[0] || '';
                    const start = selection.index - matchedText.length - 1;
                    if (startIndex !== -1) {
                        setTimeout(() => {
                            this.quill.deleteText(start, matchedText.length);
                            this.quill.insertEmbed(start, 'image', {
                                src: hrefLink.slice(1, hrefLink.length - 1),
                                alt: altText
                            });
                        }, 0);
                    }
                }
            },
            {
                name: 'link',
                pattern: LINK_PATTERN,
                action: ({text, selection, pattern}: ActionParams) => {
                    const startIndex = text.search(pattern);
                    const matchedText = (text.match(pattern) || [])[0] || '';
                    const hrefText = (text.match(/\[(.*?)]/g) || [])[0] || '';
                    const hrefLink = (text.match(/\((.*?)\)/g) || [])[0] || '';
                    const start = selection.index - matchedText.length - 1;
                    if (startIndex !== -1) {
                        setTimeout(() => {
                            this.quill.deleteText(start, matchedText.length);
                            this.quill.insertText(start, hrefText.slice(1, hrefText.length - 1), 'link', hrefLink.slice(1, hrefLink.length - 1));
                        }, 0);
                    }
                }
            }
        ];

        this.quill.on('text-change', (delta) => {
            if (delta && delta.ops) {
                for (const op of delta.ops) {
                    if (Object.prototype.hasOwnProperty.call(op, 'insert')) {
                        if (op.insert === ' ') {
                            this.onSpace();
                        } else if (op.insert === '\n') {
                            this.onEnter();
                        }
                    }
                }
            }
        });
    }

    isValid(text: string, tagName: string) {
        return (
            typeof text !== 'undefined' &&
            text &&
            this.ignoreTags.indexOf(tagName) === -1
        );
    }

    onSpace() {
        const selection = this.quill.getSelection();
        if (!selection) return;
        const [line, offset] = this.quill.getLine(selection.index);
        if (line) {
            const text = line.domNode?.textContent || '';
            const lineStart = selection.index - offset;
            if (this.isValid(text, line.domNode?.tagName || '')) {
                for (const match of this.matches) {
                    const matchedText = text.match(match.pattern);
                    if (matchedText) {
                        match.action({text, selection, pattern: match.pattern, lineStart});
                        return;
                    }
                }
            }
        }
    }

    onEnter() {
        const selection = this.quill.getSelection();
        if (!selection) return;
        const [line, offset] = this.quill.getLine(selection.index);
        if (line) {
            const text = (line.domNode?.textContent || '') + ' ';
            const lineStart = selection.index - offset;
            selection.length = selection.index++;
            if (this.isValid(text, line.domNode?.tagName || '')) {
                for (const match of this.matches) {
                    const matchedText = text.match(match.pattern);
                    if (matchedText) {
                        match.action({text, selection, pattern: match.pattern, lineStart});
                        return;
                    }
                }
            }
        }
    }
}
