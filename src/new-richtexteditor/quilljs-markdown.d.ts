declare module 'quilljs-markdown' {
    import Quill from 'quill';

    declare type TagName =
        'blockquote'
        | 'bold'
        | 'italic'
        | 'link'
        | 'code'
        | 'pre'
        | 'ol'
        | 'ul'
        | 'strikethrough'
        | 'checkbox'
        | 'h1'
        | 'h2'
        | 'h3'
        | 'h4'
        | 'h5'
        | 'h6'
        | 'header'

    declare type TagConfiguration = { pattern: RegExp };

    declare type Options = {
        ignoreTags: TagName[];
        tags: Record<TagName, TagConfiguration>;
    }

    export default class QuillMarkdown {
        constructor(quillInstance: Quill, options?: Options);

        onRemoveElement(range: any);

        destroy(): void;
    }
}

declare module 'quills-markdown/src/tags' {
    import Quill from 'quill';

    export default class TagsOperators {
        constructor(quillInstance: Quill, options?: any);

        getOperatorsAll(): any[];
    }
}