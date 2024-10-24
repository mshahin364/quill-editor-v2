import {HyperLinkRenderer} from './HyperLinkRenderer';

export class QumuCloudRenderer implements HyperLinkRenderer {
	private readonly videoUrl: string;

	constructor(videoUrl: string) {
		this.videoUrl = videoUrl;
	}

	url(): string {
		return `${this.videoUrl}?autoplay=0`;
	}
}