import VideoUtils from '../hyperlink-renderer/VideoUtils';
import {CommonUtil} from "./CommonUtil.ts";

const EMBEDDED_FILE_REGX = '/attachments/embedded-files/';

export class HtmlConverter {
    document: Document;
    hasError: boolean;

    constructor(htmlString: string) {
        this.document = new DOMParser().parseFromString(htmlString, 'text/html');
        this.hasError = this.document.querySelector('parsererror') !== null;
    }

    static createConverter(htmlString: string) {
        return new HtmlConverter(htmlString);
    }

    static toServerHtmlFormat(value: string) {
        return HtmlConverter.createConverter(replaceZeroWidthCharacters(value)).toServerFormat().getHtmlString();
    }

    static toRenderHtmlFormat(value: string) {
        return HtmlConverter.createConverter(value).toRenderFormat().getHtmlString();
    }

    static toSimpleHtmlFormat(value: string) {
        return HtmlConverter.createConverter(value).toSimpleFormat().getHtmlString();
    }

    public toServerFormat() {
        replaceAllIframeWithAnchor(this.document.body);
        sanitizeImages(this.document.body);
        return this;
    }

    public toRenderFormat() {
        replaceVideoAnchorWithIframe(this.document.body);
        return this;
    }

    public toSimpleFormat() {
        replaceImageWithAnchor(this.document.body);
        return this;
    }

    public getHtmlString() {
        if (!this.hasError) {
            return this.document.body.innerHTML;
        } else {
            return '';
        }
    }

    public getText() {
        if (!this.hasError) {
            return this.document.body.innerText;
        }
        return '';
    }

    static getPlainText(htmlString: string) {
        return HtmlConverter.createConverter(htmlString).getText();
    }

    static createExternalImageUrl(imageUrl: string, basePath: string = `/a/attachments/embedded-file-url`) {
        const indexOfFileUrl = imageUrl.indexOf(basePath);
        const indexOfEmbeddedFile = imageUrl.indexOf(EMBEDDED_FILE_REGX);

        if (indexOfFileUrl === 0 || indexOfEmbeddedFile > -1) {
            if (CommonUtil.isSameOrigin(window.location.href, imageUrl)) {
                const url = new URL(imageUrl);
                return imageUrl.replace(url.origin, '');
            } else {
                return imageUrl;
            }
        } else if (CommonUtil.isSameOrigin(window.location.href, imageUrl) && (indexOfFileUrl > 0 && imageUrl.includes(basePath) || (indexOfEmbeddedFile > 0 && imageUrl.includes(EMBEDDED_FILE_REGX)))) {
            const url = new URL(imageUrl);
            return imageUrl.replace(url.origin, '');
        }

        const base64Url = window.btoa(imageUrl);
        const urlEncode = encodeURIComponent(base64Url);
        return `${basePath}?url=${urlEncode}`;
    }
}

function replaceAllIframeWithAnchor(htmlElement: HTMLElement) {
    const allIframes = htmlElement.querySelectorAll('iframe[data-url]');
    allIframes.forEach(iframe => {
        const anchorElement = document.createElement('a');
        const iframeSrc = iframe.getAttribute('data-url');
        const allCssClass = iframe.getAttribute('class');
        anchorElement.setAttribute('href', iframeSrc!);
        anchorElement.setAttribute('data-embeddable', 'true');
        anchorElement.innerText = iframeSrc!;
        if (allCssClass) {
            anchorElement.setAttribute('class', allCssClass?.split(' ')?.filter(cls => cls !== 'selected')?.join(' '));
        }
        iframe.replaceWith(anchorElement);
    });
}

function replaceVideoAnchorWithIframe(htmlElement: HTMLElement) {
    const allAnchorTags = htmlElement.querySelectorAll('a[href]');
    allAnchorTags.forEach(anchorElement => {
        const href = anchorElement.getAttribute('href') || '';
        const cssClass = anchorElement.getAttribute('class');
        if (VideoUtils.isValidVideoUrl(href) && isEmbeddableElement(anchorElement)) {
            const iframe = document.createElement('iframe');
            if (cssClass) {
                iframe.setAttribute('class', cssClass);
            } else {
                iframe.setAttribute('class', 'ql-video');
            }
            iframe.setAttribute('src', VideoUtils.getEmbedUrl(href));
            iframe.setAttribute('frameborder', '0');
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('data-url', href!);
            iframe.setAttribute('title', 'External Video');
            anchorElement.replaceWith(iframe);
        }
    });
}

function replaceImageWithAnchor(htmlElement: HTMLElement) {
    const allImageTags = htmlElement.querySelectorAll('img[src]');
    allImageTags.forEach(imgElement => {
        const anchor = document.createElement('a');
        anchor.innerText = imgElement.getAttribute('alt') || '';
        anchor.href = imgElement.getAttribute('src') || '';
        anchor.setAttribute('data-image', 'true');
        imgElement.replaceWith(anchor);
    });
}

const isEmbeddableElement = (element: Element) => {
    const isEmbeddable = element.getAttribute('data-embeddable');
    return (isEmbeddable === 'true' || !isEmbeddable);
};

const replaceZeroWidthCharacters = (value: string) => {
    return value.replace(/[\u200B-\u200D\uFEFF]/gm, '');
};

function sanitizeImages(htmlElement: HTMLElement) {
    const allImageElements = htmlElement.querySelectorAll('img');
    allImageElements.forEach(imageElement => {
        if (imageElement.hasAttribute('style')) {
            imageElement.removeAttribute('style');
        }

        if (imageElement.hasAttribute('data-size')) {
            imageElement.removeAttribute('data-size');
        }
        if (imageElement.hasAttribute('class')) {
            imageElement.classList.remove('active');
        }
    });
}