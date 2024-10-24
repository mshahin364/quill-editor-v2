import Quill from 'quill';
import {HtmlConverter} from '../utils/HtmlConverter';
import {ImageBlot} from '../blots/ImageBlot';
import type DeltaStatic from 'quill-delta';

const Delta = Quill.import('delta');

export class ImagePasteModule {
	quill: any;
	options: {};
	handlePasteImageBind: (node: any, delta: DeltaStatic) => any;

	constructor(quill: Quill, options: {} = {}) {
		this.quill = quill;
		this.options = options;
		this.handlePasteImageBind = this.handlePasteImage.bind(this);
		this.quill.clipboard.addMatcher('IMG', this.handlePasteImageBind);
	}

	handlePasteImage(node: any, delta: DeltaStatic) {
		if (this.quill?.options?.formats?.includes('image')) {
			const src = node.src;
			if (/data:image\//g.test(src)) {
				const newDelta = new Delta();
				newDelta.insert('');
				return newDelta;
			} else {
				const newDelta = new Delta();
				const insertedImage = ImageBlot.value(node);
				insertedImage.src = HtmlConverter.createExternalImageUrl(src, ImageBlot.basePath);
				newDelta.insert({image: insertedImage});
				return newDelta;
			}
		}
		return delta;
	}
}