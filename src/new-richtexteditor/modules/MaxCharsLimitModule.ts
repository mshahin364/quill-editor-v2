export class MaxCharsLimitModule {
	quill: any;
	maxCharacters: number;
	totalCharsLength: number = 0;

	constructor(quill: any, options: { maxCharacters: number }) {
		this.quill = quill;
		this.maxCharacters = options.maxCharacters;
		quill.container.addEventListener('keypress', this.checkAndPreventMaxLimit);
		quill.container.addEventListener('keydown', (event: KeyboardEvent) => {
			if (event.key === 'Enter' && this.totalCharsLength >= this.maxCharacters) {
				event.preventDefault();
			}
		});
	}

	checkAndPreventMaxLimit = (event: any) => {
		if (this.totalCharsLength >= this.maxCharacters) {
			event.preventDefault();
		}
	};
}