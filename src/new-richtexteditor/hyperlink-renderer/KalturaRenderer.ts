import { HyperLinkRenderer } from './HyperLinkRenderer';

export class KalturaRenderer implements HyperLinkRenderer {
    private readonly videoId: string;

    constructor(videoId: string) {
        this.videoId = videoId;
    }

    url() {
        return `https://videos.kaltura.com/embed/secure/iframe/entryId/${this.videoId}`
    }
}