import {Quill} from 'react-quill-new';
import {HtmlConverter} from '../utils/HtmlConverter';

const Image = Quill.import('formats/image') as any;

const ImageFormatAttributesList = [
    'alt',
    'height',
    'width',
    'style',
    'class',
    'data-align'
];

class ImageBlot extends Image {
    static basePath = '';
    static create(value: any) {
        const node = super.create();
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
                node.setAttribute('width', value.width);
            } else {
                node.setAttribute('width', '300');
            }

            if (value?.height) {
                node.setAttribute('height', value.height);
            }
            if (value?.class) {
                const classes = value.class.split(/ /);
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
        };
    }

    static formats(domNode: any) {
        return ImageFormatAttributesList.reduce((formats: any, attribute) => {
            if (domNode.hasAttribute(attribute)) {
                formats[attribute] = domNode.getAttribute(attribute);
            }
            return formats;
        }, {});
    }

    format(name: any, value: any) {
        if (ImageFormatAttributesList.indexOf(name) > -1) {
            if (value) {
                this.domNode.setAttribute(name, value);
            } else {
                this.domNode.removeAttribute(name);
            }
        } else {
            super.format(name, value);
        }
    }
}

export {ImageBlot};