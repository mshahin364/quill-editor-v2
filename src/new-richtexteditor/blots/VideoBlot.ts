import Video from "quill/formats/video";
import VideoUtils from '../hyperlink-renderer/VideoUtils';

class VideoBlot extends Video {
    static create(value: any) {
        const node = super.create(value);
        const embedUrl = this.extractVideoUrl(value);
        node.setAttribute('src', embedUrl);
        node.setAttribute('frameborder', '0');
        node.setAttribute('allowfullscreen', 'true');
        node.setAttribute('data-url', value);
        return node;
    }

    static formats(node: any) {
        // Return custom attributes
        return {
            'data-url': node.getAttribute('data-url')
        };
    }

    static value(node: any) {
        return node.getAttribute('data-url');
    }

    format(name: any, value: any) {
        // Handle custom attributes
        if (name === 'data-url') {
            if (value) {
                this.domNode.setAttribute(name, value);
            } else {
                this.domNode.removeAttribute(name);
            }
        } else {
            super.format(name, value);
        }
    }

    static extractVideoUrl(url: any) {
        return url ? VideoUtils.getEmbedUrl(url) : '';
    }
}

export {VideoBlot};