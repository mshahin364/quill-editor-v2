import { HyperLinkRenderer } from './HyperLinkRenderer';

export class VimeoRenderer implements HyperLinkRenderer {
    private readonly videoId: string;

    constructor(videoId: string) {
        this.videoId = videoId;
    }

    url() {
        return `https://player.vimeo.com/video/${this.videoId}`;
    }
}