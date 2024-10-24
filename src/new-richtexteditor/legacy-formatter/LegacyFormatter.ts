import { SimpleUrlFilter } from './SimpleUrlFilter';

const NOT_WHITESPACE_REGEX = /\S/;
const ONLY_WHITESPACE_REGEX = /^\s+$/;

export class StringBuilder {
    private readonly input: string[];

    constructor(input?: string[]) {
        this.input = input || [];
    }

    append(char: string) {
        this.input.push(char);
    }

    toString() {
        return this.input.join('');
    }
}

export class LegacyFormatter {
    private _input: string = '';

    constructor(input: string) {
        this._input = input;
    }

    private static processWord(word: string) {
        let processedWord = word;
        const filters = [new SimpleUrlFilter(word)];
        for (let i = 0; i < filters.length; i++) {
            processedWord = filters[i].getFilteredResult();
        }
        return processedWord;
    }

    public formatAsHtml() {
        if (ONLY_WHITESPACE_REGEX.test(this.input)) {
            return '';
        }

        let lastCharacterIsWhitespace = false;
        let result = new StringBuilder();
        let currentWord = new StringBuilder();

        for (let i = 0; i < this.input.length; i++) {
            const c = this.input[i];
            if (NOT_WHITESPACE_REGEX.test(c)) {
                currentWord.append(c);
                lastCharacterIsWhitespace = false;
            } else {
                if (!lastCharacterIsWhitespace) {
                    result.append(LegacyFormatter.processWord(currentWord.toString()));
                    currentWord = new StringBuilder();
                }
                lastCharacterIsWhitespace = true;
                result.append(c);
            }
        }

        if (!lastCharacterIsWhitespace) {
            result.append(LegacyFormatter.processWord(currentWord.toString()));
        }

        return `<p>${result.toString()}</p>`;
    }

    public get input() {
        return this._input;
    }

    public set input(input: string) {
        this._input = input;
    }
}