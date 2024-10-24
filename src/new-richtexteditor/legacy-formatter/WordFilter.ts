export interface WordFilter {
    matches(word: string): boolean;

    getFilteredResult(): string;
}