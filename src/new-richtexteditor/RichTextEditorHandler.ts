import ReactQuill from "react-quill-new";

export type RichTextEditorHandler = {
    setText(value: string): void;
    setTextWithBlur(value: string): void;
    setHtml(value: string): void;
    setHtmlWithBlur(value: string): void;
    setCursorAtEnd(): void;
    insertClassification(text: string): void;
    hasInvalidClassifications(): boolean;
    insertTextAtEnd(text: string): void;
    focus(): void;
    blur(): void;
    clear(): void;
    getReactQuill(): ReactQuill | null;
    getPlainText(): string;
    getHtmlContent(): string;
    isCharacterLimitExceeded(): boolean;
}