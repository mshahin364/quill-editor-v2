import { HyperLinkRenderer } from './HyperLinkRenderer';

export class VidyardRenderer implements HyperLinkRenderer {
    private readonly videoId: string;

    constructor(videoId: string) {
        this.videoId = videoId;
    }

    url(): string {
        return `https://play.vidyard.com/${this.videoId}.html?`;
    }
}