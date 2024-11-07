import {OSTypes} from "../../types/CommonEnums.ts";

export class CommonUtil {
    static uuid = (): string => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & (0x3 | 0x8));
            return v.toString(16);
        });
    };

    static flashElement(targetId: string) {
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
            targetEl.classList.add('flash');
            setTimeout(() => targetEl.classList.remove('flash'), 1200);
        }
    }

    static wait(time: number = 0): Promise<boolean> {
        return new Promise((resolve) => setTimeout(() => resolve(true), time));
    }

    static isSameOrigin(baseUrl: string, compareUrl: string) {
        const parseURL = (sourceUrl: string) => {
            let url = null;
            try {
                url = new URL(sourceUrl);
            } catch (error) {
                console.error(error);
            }
            return url;
        };

        const urlA = parseURL(baseUrl);
        const urlB = parseURL(compareUrl);

        if (!urlA || !urlB) {
            return false;
        }

        return (urlA.origin === urlB.origin) || (
            urlA.protocol === urlB.protocol &&
            urlA.hostname === urlB.hostname &&
            urlA.port === urlB.port
        );
    }

    static isValidUrl(url: string) {
        return (/^(http)(s?):\/\/.+\..+/gmi.test(url));
    }

    static isImageLink(url: string) {
        return (/.*[\\.\/](gif|bmp|webp|png|jpe?g)$/gmi.test(url));
    }

    static hasRegexMatch(regex: RegExp, text: string): boolean {
        return regex.test(text);
    }

    static getRegexMatchedText(regex: RegExp, text: string): string[] {
        return text.match(regex) || [];
    }

    static isHtmlInject = (content: string) => {
        const HTML_REGEX = /<\/?[A-Za-z\s]*(\/)?>?/gi;
        return HTML_REGEX.test(content);
    };

    static getOS = (): OSTypes => {
        const userAgent = navigator.userAgent;
        if (navigator.userAgent.search('Windows') !== -1) {
            return OSTypes.WINDOWS;
        } else if (userAgent.search('Mac') !== -1) {
            return OSTypes.MACOS;
        } else if (userAgent.search('Linux') !== -1) {
            return OSTypes.LINUX;
        } else {
            return OSTypes.UNKNOWN;
        }
    };

    static removeDuplicates(data: any[]) {
        return [...new Set(data)];
    }
}