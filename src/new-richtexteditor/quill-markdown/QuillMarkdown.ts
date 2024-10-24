import QuillJsMarkdown from 'quilljs-markdown';

export default class MarkdownActivity extends QuillJsMarkdown {
	quillJS: any;
	options: any;

	constructor(quillJS: any, options: any = {}) {
		super(quillJS, options);
		this.quillJS = quillJS;
		this.options = options;
	}

	onRemoveElement(range: any) {
		const selection = this.quillJS.getSelection();
		if (selection && range && range.delete === 1) {
			const removeItem = this.quillJS.getLine(selection.index);
			const lineItem = removeItem[0];
			// @ts-ignore
			const releaseTag = this.matches.find((e: any) => e.name === lineItem.domNode.tagName.toLowerCase());
			if (releaseTag && releaseTag.release) {
				releaseTag.release(selection);
			}
		}
	}
}