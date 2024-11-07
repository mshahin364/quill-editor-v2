import Quill from 'quill';
import type DeltaStatic from 'quill-delta';
import VideoUtils from '../hyperlink-renderer/VideoUtils';
import {CommonUtil} from "../utils/CommonUtil.ts";

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