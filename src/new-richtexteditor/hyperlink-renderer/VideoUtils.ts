import {YoutubeRenderer} from './YoutubeRenderer';
import {VimeoRenderer} from './VimeoRenderer';
import {VidyardRenderer} from './VidyardRenderer';
import {KalturaRenderer} from './KalturaRenderer';
import {FlickrRenderer} from './FlickrRenderer';
import {BrightcoveRenderer} from './BrightcoveRenderer';
import {QumuCloudRenderer} from './QumuCloudRenderer';

export default class VideoUtils {
	private static readonly YOUTUBE_PATTERN = RegExp('^((?:https?:)?//)?((?:www|m)\\.)?(?:youtube\\.com|youtu.be)(\\/(?:[\\w\\-]+\\?v=|embed/|v/)?)([\\w\\-]+)(\\S+)?$', 'i');
	private static readonly VIMEO_PATTERN = RegExp('^(https?://)?((?:www|player)\\.)?vimeo.com/(?:channels\\/(?:\\w+\\/)?|groups\\/([^\\/]*)\\/videos\\/|video\\/)?(\\d+)', 'i');
	private static readonly VIDYARD_PATTERN = RegExp('^(?:(https?)://)?(?:www\\.)?(video|share)\\.vidyard\\.com\\/watch.([a-zA-Z0-9_-]+)', 'i');
	private static readonly KALTURA_PATTERN = RegExp('^(?:(https?)://)?(?:www\\.)?videos\\.kaltura\\.com\\/media\\/.*\\/([a-zA-Z0-9_-]+)', 'i');
	private static readonly FLICKR_PATTERN = RegExp('^(?:https://)?(?:www\\.)?flickr\\.com/photos/([^/]+/\\d+)?', 'i');
	private static readonly BRIGHTCOVE_PATTERN = RegExp('((http|https)?://)?(link.brightcove.com|bcove.me|players.brightcove.net)/([a-z0-9_-]+)([^a-z0-9_-].*)?', 'i');
	private static readonly QUMUCLOUD_PATTERN = RegExp('((http|https)?://)?(?:www\\.)?((\\w+).qumucloud.com)\\/([a-z0-9_-]+)([^a-z0-9_-].*)?', 'i');

	static isValidVideoUrl(url: string) {
		return this.YOUTUBE_PATTERN.test(url)
			|| this.VIMEO_PATTERN.test(url)
			|| this.VIDYARD_PATTERN.test(url)
			|| this.KALTURA_PATTERN.test(url)
			|| this.FLICKR_PATTERN.test(url)
			|| this.BRIGHTCOVE_PATTERN.test(url)
			|| this.QUMUCLOUD_PATTERN.test(url);
	}

	static getEmbedUrl(url: string) {
		let matcher = url.match(this.YOUTUBE_PATTERN);
		if (matcher) {
			return new YoutubeRenderer(matcher[4], matcher[5]).url();
		}

		matcher = url.match(this.VIMEO_PATTERN);
		if (matcher) {
			return new VimeoRenderer(matcher[4]).url();
		}

		matcher = url.match(this.VIDYARD_PATTERN);
		if (matcher) {
			return new VidyardRenderer(matcher[3]).url();
		}

		matcher = url.match(this.KALTURA_PATTERN);
		if (matcher) {
			return new KalturaRenderer(matcher[2]).url();
		}

		matcher = url.match(this.FLICKR_PATTERN);
		if (matcher) {
			return new FlickrRenderer(matcher[1]).url();
		}

		matcher = url.match(this.BRIGHTCOVE_PATTERN);
		if (matcher) {
			return new BrightcoveRenderer(matcher[0]).url();
		}

		matcher = url.match(this.QUMUCLOUD_PATTERN);
		if (matcher) {
			return new QumuCloudRenderer(matcher[0]).url();
		}
		return url;
	}
}