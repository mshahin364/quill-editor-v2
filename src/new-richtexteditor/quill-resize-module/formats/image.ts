import Quill from 'quill';
const BaseImageFormat = Quill.import('formats/image');

const ATTRIBUTES = ['alt', 'height', 'width', 'style', 'data-size'];

class Image extends BaseImageFormat {
	static formats(domNode: any) {
		if (domNode.__handling && domNode.__formats) {
			return domNode.__formats;
		}

		return ATTRIBUTES.reduce((formats: any, attribute) => {
			if (domNode.hasAttribute(attribute)) {
				formats[attribute] = domNode.getAttribute(attribute);
			}
			return formats;
		}, {});
	}

	format(name:any, value:any) {
		if (ATTRIBUTES.indexOf(name) > -1) {
			if (value) {
				this.domNode.setAttribute(name, value);
			} else {
				this.domNode.removeAttribute(name);
			}
		} else {
			super.format(name, value);
		}
	}

	handling(handling:any) {
		this.domNode.__formats = this.formats(this.domNode);
		this.domNode.__handling = handling;
	}
}

export {Image, ATTRIBUTES};
