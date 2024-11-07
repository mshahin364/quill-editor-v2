import capitalize from 'lodash/capitalize';
import {RichTextEditorHotKey} from "../RichTextEditorHotKey.ts";
import {CommonUtil} from "./CommonUtil.ts";
import {OSTypes} from "../../types/CommonEnums.ts";

export class RichTextEditorHelper {
    static readonly VALID_TITLES = ['bold', 'italic', 'underline', 'strike', 'blockquote', 'link', 'video', 'image'];

    static getHotKeyConfig(shortcut: RichTextEditorHotKey) {
        const keys = shortcut.toLowerCase().split('+');
        const config = {key: '', ctrlKey: false, shiftKey: false, shortKey: false, altKey: false};
        keys.forEach((key) => {
            switch (key) {
                case 'cmd':
                    config.shortKey = true;
                    return;
                case 'shift':
                    config.shiftKey = true;
                    return;
                case 'ctrl':
                    config.ctrlKey = true;
                    return;
                case 'opt':
                    config.altKey = true;
                    return;
                default:
                    config.key = key;
            }
        });
        return config;
    }

    static setButtonTitle(el: HTMLElement) {
        let filteredTitle = '';
        let shortcut = '';
        el.classList.forEach(_class => {
            const title = _class.replace('ql-', '');
            if (RichTextEditorHelper.VALID_TITLES.includes(title)) {
                filteredTitle = RichTextEditorHelper.getTitleWithShortCut(title);
            } else {
                const value = el.getAttribute('value') || '';
                if (title === 'list' || title === 'align') {
                    if (value === 'justify') {
                        shortcut = RichTextEditorHelper.getOperatingSystemBasedShortcut(RichTextEditorHotKey.JUSTIFY);
                        filteredTitle = `Justify (${shortcut})`;
                    } else if (value === 'bullet') {
                        shortcut = RichTextEditorHelper.getOperatingSystemBasedShortcut(RichTextEditorHotKey.BULLETED_LIST);
                        filteredTitle = `Bulleted list (${shortcut})`;
                    } else if (value) {
                        filteredTitle = value + ' ' + title;
                        filteredTitle = RichTextEditorHelper.getTitleWithShortCut(filteredTitle);
                    } else {
                        shortcut = RichTextEditorHelper.getOperatingSystemBasedShortcut(RichTextEditorHotKey.LEFT_ALIGN);
                        filteredTitle = `Left align (${shortcut})`;
                    }
                } else if (title === 'indent') {
                    if (parseInt(value) > 0) {
                        shortcut = RichTextEditorHelper.getOperatingSystemBasedShortcut(RichTextEditorHotKey.INCREASE_INDENT);
                        filteredTitle = `Increase indent (${shortcut})`;
                    } else {
                        shortcut = RichTextEditorHelper.getOperatingSystemBasedShortcut(RichTextEditorHotKey.DECREASE_INDENT);
                        filteredTitle = `Decrease indent (${shortcut})`;
                    }
                }
            }
        });

        if (filteredTitle && el.getAttribute('type') === 'button') {
            el.setAttribute('title', capitalize(filteredTitle));
        }
    }

    static getOperatingSystemBasedShortcut(shortcut: string) {
        if (shortcut && CommonUtil.getOS() !== OSTypes.MACOS) {
            return shortcut.replace('cmd', 'ctrl').replace('opt', 'alt');
        }
        return shortcut;
    }

    static getTitleWithShortCut(title: string) {
        const key = title.replace(' ', '_').toUpperCase() as keyof typeof RichTextEditorHotKey;
        const shortcut = RichTextEditorHotKey[key];
        const osBasedShortcut = RichTextEditorHelper.getOperatingSystemBasedShortcut(shortcut);
        return `${title} (${osBasedShortcut})`;
    }

    static fixQuillAccessibility(editorId: string, ariaLabelledBy = '', ariaLabel: string) {
        const editorElement = document.getElementById(editorId)?.getElementsByClassName('ql-editor')[0];

        if (editorElement) {
            editorElement.setAttribute('role', 'textbox');
            if (ariaLabelledBy) {
                editorElement.setAttribute('aria-labelledby', ariaLabelledBy);
            } else {
                editorElement.setAttribute('aria-label', ariaLabel);
            }
            editorElement.removeAttribute('aria-owns');
        }
    }
}