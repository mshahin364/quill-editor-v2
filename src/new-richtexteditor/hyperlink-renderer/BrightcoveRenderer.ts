import { HyperLinkRenderer } from './HyperLinkRenderer';

export class BrightcoveRenderer implements HyperLinkRenderer {
    private readonly videoUrl: string;

    constructor(videoUrl: string) {
        this.videoUrl = videoUrl;
    }

    url(): string {
        return this.videoUrl;
    }
}