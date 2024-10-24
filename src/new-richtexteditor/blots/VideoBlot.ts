import {Quill} from 'react-quill-new';
import VideoUtils from '../hyperlink-renderer/VideoUtils';

const Video = Quill.import('formats/video')  as any;

class VideoBlot extends Video {
    static create(value: any) {
        const node = super.create();
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
                this.domNode.removeAttribute(name, value);
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