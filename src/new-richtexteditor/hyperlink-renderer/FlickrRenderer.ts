import { HyperLinkRenderer } from './HyperLinkRenderer';

export class FlickrRenderer implements HyperLinkRenderer {
    private readonly photoId: string;

    constructor(photoId: string) {
        this.photoId = photoId
    }

    url() {
        return `https://embedr.flickr.com/photos/${this.photoId}`
    }
}