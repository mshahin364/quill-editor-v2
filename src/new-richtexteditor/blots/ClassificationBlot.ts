import Quill from 'quill';
import isNil from 'lodash/isNil';

const Base = Quill.import('blots/embed') as any;

export type ClassificationBlotValue = {
	text: string,
	classification: string,
	extensions: string[]
}
class ClassificationBlot extends Base {
	static blotName = 'classifications';
	static tagName = 'mark';
	static dataClassification = 'data-classification';
	static dataClassificationExtension = 'data-classification-extension';

	private readonly nodeValue: ClassificationBlotValue;
	constructor(domNode: Node, value: ClassificationBlotValue) {
		super(domNode);
		this.nodeValue = value;
	}


	static create(value: ClassificationBlotValue) {
		const domNode = super.create();
		domNode.innerHTML = value.text.replace(/\/\)$/, ')');
		domNode.setAttribute(ClassificationBlot.dataClassification, value.classification);
		if (value.extensions?.length > 0) {
			domNode.setAttribute(ClassificationBlot.dataClassificationExtension, value.extensions.join(','));
		}
		domNode.setAttribute('class', `classification-label classification-label-${value.classification.toLocaleLowerCase()} notranslate`);

		return domNode;
	}

	static value(domNode: HTMLElement): ClassificationBlotValue | null {
		const classification = domNode.getAttribute(ClassificationBlot.dataClassification);
		if (!isNil(classification)) {
			const text = domNode.innerText?.trim() || '';
			const extensions = domNode.getAttribute(ClassificationBlot.dataClassificationExtension);
			return {
				text,
				classification: domNode.getAttribute(ClassificationBlot.dataClassification),
				extensions: !isNil(extensions) ? extensions.split(',') : []
			} as ClassificationBlotValue;
		}
		return null;
	}

	get text() {
		return this.nodeValue?.text || '';
	}

	public hasPreviousSiblings(): boolean {
		return !isNil(this.prev);
	}

	public hasNonParagraphParent(): boolean {
		return this.parent && this.parent.domNode && this.parent.domNode.nodeName !== 'P';
	}

	public replaceWithTextValue(): void {
		this.replaceWith('text', this.text);
	}

	public isValid(): boolean {
		return !!this.nodeValue;
	}

	// quilljs bug, this method should not be called for Embed blot, but it's being called
	public appendChild(_blot: any): void {
	}
}

export { ClassificationBlot };