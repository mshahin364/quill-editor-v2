import Quill from 'quill';
import type DeltaStatic from 'quill-delta';
import VideoUtils from '../hyperlink-renderer/VideoUtils';
import {CommonUtil} from "../utils/CommonUtil.ts";

const quillDelta = Quill.import('delta');
const EMPTY_SPACE_PATTERN = /\s+/;

export class LinkFormatModule {
    quill: any;
    options: {};
    handlePasteBind: (node: any, delta: DeltaStatic) => any;

    constructor(quill: Quill, options: {} = {}) {
        this.quill = quill;
        this.options = options;
        this.handlePasteBind = this.handlePaste.bind(this);
        this.quill.clipboard.addMatcher(Node.TEXT_NODE, this.handlePasteBind);

        this.quill.on('text-change', (delta: DeltaStatic, _oldContents: DeltaStatic, source: string) => setTimeout(() => {
            if (delta.ops?.length === 2 && delta.ops[0].retain && delta.ops[1].insert && source === 'user') {
                const cursorIndex = this.quill.getSelection()?.index;
                const quillText = this.quill.getText(0, cursorIndex) as string;
                const words = quillText.split(EMPTY_SPACE_PATTERN).filter((word) => word.length > 0);
                const lastWord = words[words.length - 1];
                if (typeof delta.ops[1].insert === 'string' && (EMPTY_SPACE_PATTERN.test(delta.ops[1].insert) || delta.ops[1].attributes?.link)) {
                    return;
                }
                if (lastWord?.startsWith('http://') || lastWord?.startsWith('https://')) {
                    //revert inline formats as link formatting does not retain these
                    const revertedFormats = {
                        bold: false,
                        italic: false,
                        underline: false,
                        strike: false,
                    };
                    this.quill.formatText(cursorIndex - lastWord.length, lastWord.length, {
                        ...revertedFormats,
                        link: lastWord
                    });
                }
            }
        }, 0));
    }

    handlePaste(node: any, delta: DeltaStatic) {
        const text = node.data;
        const formats = this.quill?.options?.formats
        // tslint:disable-next-line:no-console
        if (formats?.includes('link') && CommonUtil.isValidUrl(text)
            && !(formats.includes('video') && VideoUtils.isValidVideoUrl(text))
            && !(formats.includes('image') && CommonUtil.isImageLink(text))) {
            const newDelta = new quillDelta();
            newDelta.insert(text, {link: text});
            return newDelta;
        }
        return delta;
    }
}