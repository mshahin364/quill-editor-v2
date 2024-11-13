import Quill from 'quill';
import type DeltaStatic from 'quill-delta';
import VideoUtils from '../hyperlink-renderer/VideoUtils';
import {CommonUtil} from "../utils/CommonUtil";

const DeltaL = Quill.import('delta');

export class VideoPasteModule {
    quill: any;
    options: {};
    handlePasteBind: (node: any, delta: DeltaStatic) => any;

    constructor(quill: Quill, options: {} = {}) {
        this.quill = quill;
        this.options = options;
        this.handlePasteBind = this.handlePaste.bind(this);
        this.quill.clipboard.addMatcher(Node.TEXT_NODE, this.handlePasteBind);

        this.quill.root.addEventListener('paste', function (event: any) {
            event.preventDefault();
            // Get the pasted text from the clipboard
            // @ts-ignore
            const clipboardData = event.clipboardData || window.clipboardData;
            const range = quill.getSelection();
            const pastedText = clipboardData.getData('text');
            if (range && VideoUtils.isValidVideoUrl(pastedText)) {
                const startingIndex = range.index - pastedText.length;
                quill.deleteText(startingIndex, pastedText.length);
                quill.insertEmbed(startingIndex, 'video', pastedText, 'silent');
                quill.setSelection(startingIndex + 1, 'silent');
            }
        });
    }

    handlePaste(node: any, delta: DeltaStatic) {
        const text = node.data;
        if (this.quill?.options?.formats?.includes('video') && VideoUtils.isValidVideoUrl(text)) {
            const newDelta = new DeltaL();
            newDelta.insert({video: text});
            return newDelta;
        } else if (CommonUtil.isValidUrl(text) && CommonUtil.isImageLink(text)) {
            const newDelta = new DeltaL();
            newDelta.insert('');
            return newDelta;
        }
        return delta;
    }
}