import {HyperLinkRenderer} from './HyperLinkRenderer';

export class YoutubeRenderer implements HyperLinkRenderer {
    private readonly videoId: string;
    private readonly time: string;

    constructor(videoId: string, timestamp: string) {
        this.videoId = videoId;
        this.time = timestamp !== undefined ? '?start=' + timestamp.replace('?t=', '') : '';
    }

    url(): string {
        return `https://www.youtube.com/embed/${this.videoId}${this.time}`;
    }
}