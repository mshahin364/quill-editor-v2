import {Parchment} from 'quill';
import Embed from 'quill/blots/embed';
import Container from 'quill/blots/container';
import Scroll from 'quill/blots/scroll';

import Quill from 'quill';

// const Container = Quill.import('blots/container');
// const Scroll = Quill.import('blots/scroll');

const ATTRIBUTES = [
    'data-embed-source',
    'data-type',
    'data-src',
    'data-size',
    'style'
];

// const Parchment = Quill.import('parchment');

class EmbedPlaceholder extends Embed {
    static create(value: any) {
        const node = super.create() as HTMLElement;
        if (typeof value === 'string') {
            node.setAttribute(ATTRIBUTES[0], value);
        } else {
            for (const key in value) {
                if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
                node.setAttribute(key, value[key]);
            }
        }

        node.setAttribute('contenteditable', String(false));
        node.setAttribute('unselectable', 'on');
        return node;
    }

    static formats(domNode: any) {
        if (domNode.__handling && domNode.__formats) {
            return domNode.__formats;
        }

        const attrList = ATTRIBUTES.slice(3);
        return attrList.reduce((formats: any, attribute) => {
            if (domNode.hasAttribute(attribute)) {
                formats[attribute] = domNode.getAttribute(attribute);
            }
            return formats;
        }, {});
    }

    static value(domNode: any) {
        const attrs = ATTRIBUTES.slice(0, 3);

        const result: any = {};

        attrs.forEach(attr => {
            let res: string;
            if (domNode.hasAttribute(attr)) {
                res = domNode.getAttribute(attr);
            } else {
                switch (attr) {
                    case ATTRIBUTES[0]:
                        res = encodeURIComponent(domNode.outerHTML);
                        break;
                    case ATTRIBUTES[1]:
                        res = domNode.tagName;
                        break;
                    case ATTRIBUTES[2]:
                        res = domNode.getAttribute('src');
                        break;
                    case 'style':
                        res = domNode.style.cssText;
                        break;
                    default:
                        res = domNode[attr] || '';
                }
            }

            if (res) result[attr] = res;
        });

        return result;
    }

    format(name: any, value: any) {
        const domNode = this.domNode as HTMLElement;
        if (name === 'style') {
            domNode.style.cssText = value;
            return;
        }
        if (ATTRIBUTES.indexOf(name) === -1) {
            super.format(name, value);
            return;
        }

        if (value) {
            domNode.setAttribute(name, value);
        } else {
            domNode.removeAttribute(name);
        }
    }

    handling(handling: any) {
        const domNode = this.domNode as any;
        domNode.__formats = this.formats();
        domNode.__handling = handling;
    }
}

EmbedPlaceholder.blotName = 'embed-placeholder';
EmbedPlaceholder.tagName = 'span';
EmbedPlaceholder.scope = Parchment.Scope.INLINE_BLOT;

Container?.allowedChildren?.push(EmbedPlaceholder);
Scroll.allowedChildren.push(EmbedPlaceholder as any);

// tslint:disable-next-line:max-classes-per-file
class TagPlaceholder extends EmbedPlaceholder {
}

// @ts-ignore
TagPlaceholder.tagName = ['video', 'iframe'];

// tslint:disable-next-line:max-classes-per-file
class ClassNamePlaceholder extends EmbedPlaceholder {
}

// @ts-ignore
ClassNamePlaceholder.className = 'ql-embed-placeholder';

const tagReg = /<([\w-]+)((?:\s+[\w-:.]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^>\s]+))?)*)\s*>([^<]*?)<\/\1>/g;
const attrReg = /([\w-:.]+)(?:\s*=\s*(?:"((?:\\.|[^"])*)"|'((?:\\.|[^'])*)'))?/g;

function convertPlaceholderHTML(html = '') {
    if (!html) return '';

    const matchReg = new RegExp(
        // @ts-ignore
        `class\\s*=\\s*(?:"[^"]*\\b(${ClassNamePlaceholder.className})\\b[^"]*"|'[^']*\\b(${ClassNamePlaceholder.className})\\b[^']*')`
    );
    return html.replace(tagReg, (m, tag, attrs = '') => {
        if (
            !tag ||
            tag.toLowerCase() !== EmbedPlaceholder.tagName ||
            !matchReg.test(attrs)
        ) {
            return m;
        }

        const attributes: any = getAttributes(attrs);
        const source = decodeURIComponent(attributes[ATTRIBUTES[0]]);

        return replaceHTMLAttr(source, {
            style: attributes.style,
            'data-size': attributes['data-size']
        });
    });
}

function getAttributes(str: string) {
    const attributes: any = {};
    // @ts-ignore
    str.replace(attrReg, (m: any, name: any, attr1: any, attr2: any) => {
        attributes[name] = (attr1 || attr2 || '').trim();
    });

    return attributes;
}

const sourceTagReg = /<([\w-]+)((?:\s+[\w-:.]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^>\s]+))?)*)\s*>/;

function replaceHTMLAttr(html = '', attrs = {}) {
    return html.replace(sourceTagReg, (_m: any, tag, attr = '') => {
        const attributes = getAttributes(attr);
        Object.assign(attributes, attrs);

        const attrsStr = Object.keys(attributes).reduce((str, key) => {
            const val = attributes[key];
            if (val == null) return str;
            str += val === '' ? ` ${key}` : ` ${key}="${val}"`;
            return str;
        }, '');

        return `<${tag}${attrsStr}>`;
    });
}

export default function register(formats = [TagPlaceholder]) {
    if (!Array.isArray(formats)) formats = [formats];
    formats.push(ClassNamePlaceholder);
    formats.forEach((fmt: any) => {
        Quill.register(fmt, true);
        fmt.tagName = EmbedPlaceholder.tagName;
        // @ts-ignore
        fmt.className = ClassNamePlaceholder.className;
    });
}

export {
    EmbedPlaceholder,
    TagPlaceholder,
    ClassNamePlaceholder,
    convertPlaceholderHTML
};
