import QuillJsMarkdown from 'quilljs-markdown';
import TagsOperators from 'quilljs-markdown/src/tags';

export default class MarkdownActivity extends QuillJsMarkdown {
    quillJS: any;
    options: any;
    private tags: any;
    private matches: any;

    constructor(quillJS: any, options: any = {}) {
        super(quillJS, options);
        this.quillJS = quillJS;
        this.options = options;
        this.tags = new TagsOperators(this.quillJS, options)
        this.matches = this.tags.getOperatorsAll()
    }

    onRemoveElement(range: any) {
        const selection = this.quillJS.getSelection();
        if (selection && range && range.delete === 1) {
            const removeItem = this.quillJS.getLine(selection.index);
            const lineItem = removeItem[0];
            const releaseTag = this.matches.find((e: any) => e.name === lineItem.domNode.tagName.toLowerCase());
            if (releaseTag && releaseTag.release) {
                releaseTag.release(selection);
            }
        }
    }
}