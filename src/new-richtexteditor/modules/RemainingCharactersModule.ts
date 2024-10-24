export class RemainingCharactersModule {
	quill: any;
	container: any;
	maximumCharsLength: number;
	label: string;

	constructor(quill: any, options: { label?: string, maxCharacter: number }) {
		this.label = options.label || 'characters left';
		this.maximumCharsLength = options.maxCharacter || 255;

		if (options.maxCharacter !== Infinity) {
			this.quill = quill;

			const counterElement = (Array.from(quill.container?.parentElement?.parentElement?.childNodes ?? []) as HTMLElement [])?.find((item: HTMLElement) => item.className === 'ql-counter');
			if (!counterElement) {
				const div = document.createElement('div');
				div.classList.add('ql-counter');
				this.container = quill.container.parentElement?.parentElement.appendChild(div);
			}
			this.renderCounter();
			quill.on('text-change', this.renderCounter);
		}
	}

	getTotalCharacters = (): number => {
		const text = (this.quill.scroll?.domNode?.innerText ?? '').replace(/[\n|\uFEFF]/gm, '');
		const emojis = this.quill.root?.getElementsByClassName('ql-emojiblot') || [];
		const allIframes = this.quill.root?.querySelectorAll('iframe[data-url]');
		const allImages = this.quill.root?.querySelectorAll('img');
		return text.length + emojis.length + (allIframes?.length ?? 0) + (allImages?.length ?? 0);
	}

	isCharacterLimitExceeded = (): boolean => {
		return this.maximumCharsLength < this.getTotalCharacters();
	}

	renderCounter = () => {
		const totalCharacters = this.getTotalCharacters();

		if (this.container) {
			this.container.innerHTML = `${this.maximumCharsLength - totalCharacters} ${this.label}`;
			if (this.isCharacterLimitExceeded()) {
				this.container.classList.add('characters-exceed');
			} else {
				this.container.classList.remove('characters-exceed');
			}
		}
	}
}