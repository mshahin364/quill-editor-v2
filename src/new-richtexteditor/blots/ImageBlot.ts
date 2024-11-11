import BaseImageFormat from 'quill/blots/embed';
import {HtmlConverter} from '../utils/HtmlConverter';

const ImageFormatAttributesList = [
    'alt',
    'height',
    'width',
    'style',
    'class',
    'data-align'
];

class ImageBlot extends BaseImageFormat {
    static basePath = '';
    static blotName = 'image';
    static tagName = 'img';

    static create(value: HTMLImageElement) {
        const node = super.create() as HTMLImageElement;
        node.setAttribute('class', 'ql-image');
        node.setAttribute('loading', 'lazy');

        if (typeof value === 'string') {
            node.setAttribute('src', HtmlConverter.createExternalImageUrl(value, this.basePath));
            node.setAttribute('alt', 'Image File');
            node.setAttribute('width', '300');
        } else if (typeof value === 'object') {
            node.setAttribute('alt', value.alt || 'Image file');
            node.setAttribute('src', HtmlConverter.createExternalImageUrl(value.src, this.basePath));
            if (value?.width) {
                node.setAttribute('width', value.width.toString());
            } else {
                node.setAttribute('width', '300');
            }

            if (value?.height) {
                node.setAttribute('height', value.height.toString());
            }
            if (value?.className) {
                const classes = value.className.split(/ /);
                classes.forEach((cls: string) => {
                    if (!node.classList.contains(cls)) {
                        node.classList.add(cls);
                    }
                });
            }
        }
        return node;
    }

    static value(node: any) {
        return {
            alt: node.getAttribute('alt'),
            src: node.getAttribute('src'),
            width: node.getAttribute('width'),
            height: node.getAttribute('height'),
            class: node.getAttribute('class'),
            'data-size': node.getAttribute('data-size'),
        } as any;
    }

    static formats(domNode: any) {
        return ImageFormatAttributesList.reduce((formats: any, attribute) => {
            if (domNode.hasAttribute(attribute)) {
                formats[attribute] = domNode.getAttribute(attribute);
            }
            return formats;
        }, {});
    }
}

export {ImageBlot};