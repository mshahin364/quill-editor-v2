import { WordFilter } from './WordFilter';

interface RegExpMatchArray extends Array<string> {
    index?: number;
    input?: string;
}

function removeFromEndOfString(input: string, character: string) {
    if (RegExp(`${character}$`).test(input)) {
        return input.slice(0, -1);
    }
    return input;
}

export class SimpleUrlFilter implements WordFilter {
    private static PATTERN = /^((http|ftp|https):\/\/)?[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&amp;:!*#$()/~+]*[\w\-@?^=%&amp;!*#$()/~+])?$/i;
    private readonly word: string;
    private readonly matcher: RegExpMatchArray | null = null;

    constructor(word: string) {
        this.word = word;
        this.matcher = word.match(SimpleUrlFilter.PATTERN);
    }

    matches(): boolean {
        return this.matcher !== null;
    }

    getFilteredResult(): string {
        if (this.matcher !== null) {
            const url = this.matcher[0];
            return '<a href="' + removeFromEndOfString(url, '/') +
                '" rel="nofollow" class="unfurl-url classic-link" target="_blank">' + url + '</a>';
        }
        return this.word;
    }
}