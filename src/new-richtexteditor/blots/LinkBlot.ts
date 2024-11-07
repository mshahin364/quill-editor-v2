import Link from 'quill/formats/link';

const VALID_URL_REGEX = /^(https|http|ftp):\/\/.*/i;

export class LinkBlot extends Link {
    static readonly tagName = 'A';
    static readonly SANITIZED_URL = 'about:blank';

    static create(value: string) {
        let node = super.create(value);
        node.setAttribute('href', this.sanitize(value));
        node.setAttribute('rel', 'noopener noreferrer');
        node.setAttribute('data-embeddable', 'false');
        node.setAttribute('target', '_blank');
        return node;
    }

    static formats(domNode: any) {
        return domNode.getAttribute('href');
    }

    static value(node: any) {
        return node.getAttribute('href');
    }

    static sanitize(url: any) {
        return isValidUrl(url) ? url : this.SANITIZED_URL;
    }
}

export function isValidUrl(url: string) {
    return VALID_URL_REGEX.test(url);
}