import SnowTheme from 'quill/themes/snow';
import Toolbar from 'quill/modules/toolbar';
import icons from 'quill/ui/icons';
import {IdeascaleSnowTooltip} from './IdeascaleSnowTooltip';
import {RichTextEditorHelper} from '../utils/RichTextEditorHelper';
import {RichTextEditorHotKey} from "../RichTextEditorHotKey.ts";

export const HEADER_SIZE_LIST = [1, 2, 3, 4, false];
export const HEADER_SIZE_LIST_CUSTOM = [2, 3, 4, false];

class IdeascaleSnowTheme extends SnowTheme {

    private setFocus(item: HTMLElement, oldItem: HTMLElement) {
        item.focus();
        item.setAttribute('tabindex', '0');
        oldItem.setAttribute('tabindex', '-1');
    }

    private focusItem(toolbar: any, currentItem: HTMLElement, direction: 'previous' | 'next') {
        const toolbarItems = Array.from(toolbar.container.querySelectorAll('button, span.ql-picker .ql-picker-label')) as Array<HTMLElement>;

        if (toolbarItems.length > 0) {
            const currentIndex = toolbarItems.indexOf(currentItem);
            let newIndex = 0;

            if (direction === 'previous') {
                newIndex = currentIndex > 0 ? currentIndex - 1 : toolbarItems.length - 1;
            } else if (direction === 'next') {
                newIndex = currentIndex < toolbarItems.length - 1 ? currentIndex + 1 : 0;
            }
            this.setFocus(toolbarItems[newIndex], currentItem);
        }
    }

    // noinspection JSUnusedSymbols
    extendToolbar(toolbar: Toolbar) {
        if (toolbar.container != null) {
            toolbar.container.classList.add('ql-snow');
            this.buildButtons(toolbar.container?.querySelectorAll('button'), icons);
            // this.buildPickers(Array.from(toolbar.container.querySelectorAll('select')), icons);
            this.buildPickers(toolbar.container.querySelectorAll('select'), icons);
            // @ts-expect-error
            this.tooltip = new IdeascaleSnowTooltip(this.quill, this.options.bounds);
            // @ts-expect-error
            toolbar.container.querySelectorAll('button, span.ql-picker .ql-picker-label').forEach((el: HTMLElement, index: number) => {
                el.setAttribute('tabindex', (index === 0) ? '0' : '-1');
                RichTextEditorHelper.setButtonTitle(el);

                el.addEventListener('keyup', (event: KeyboardEvent) => {
                    if (event.key === 'ArrowLeft') {
                        this.focusItem(toolbar, el, 'previous');
                    } else if (event.key === 'ArrowRight') {
                        this.focusItem(toolbar, el, 'next');
                    }
                });
            });

            // hide svg from screen readers
            // @ts-expect-error
            toolbar.container.querySelectorAll('svg').forEach((svg: HTMLElement) => {
                svg.setAttribute('aria-hidden', 'true');
            });

            if (toolbar.container.querySelector('.ql-link')) {
                this.quill.keyboard.addBinding(
                    RichTextEditorHelper.getHotKeyConfig(RichTextEditorHotKey.LINK),
                    (_range: any, context: any) => {
                        toolbar.handlers.link.call(toolbar, !context.format.link);
                    },
                );
            }

            if (toolbar.container.querySelector('.ql-align')) {
                this.quill.keyboard.addBinding(
                    RichTextEditorHelper.getHotKeyConfig(RichTextEditorHotKey.RIGHT_ALIGN),
                    (_range: any) => {
                        toolbar.handlers.align.call(toolbar, 'right');
                    },
                );
                this.quill.keyboard.addBinding(
                    RichTextEditorHelper.getHotKeyConfig(RichTextEditorHotKey.CENTER_ALIGN),
                    (_range: any) => {
                        toolbar.handlers.align.call(toolbar, 'center');
                    },
                );
                this.quill.keyboard.addBinding(
                    RichTextEditorHelper.getHotKeyConfig(RichTextEditorHotKey.LEFT_ALIGN),
                    (_range: any) => {
                        toolbar.handlers.align.call(toolbar, '');
                    },
                );
                this.quill.keyboard.addBinding(
                    RichTextEditorHelper.getHotKeyConfig(RichTextEditorHotKey.JUSTIFY),
                    (_range: any) => {
                        toolbar.handlers.align.call(toolbar, 'justify');
                    },
                );
            }

            if (toolbar.container.querySelector('.ql-indent')) {
                this.quill.keyboard.addBinding(
                    RichTextEditorHelper.getHotKeyConfig(RichTextEditorHotKey.INCREASE_INDENT),
                    (_range: any, context: any) => {
                        let indent = context.format?.indent + 1 || 1;
                        toolbar.handlers.indent.call(toolbar, indent);
                    },
                );
                this.quill.keyboard.addBinding(
                    RichTextEditorHelper.getHotKeyConfig(RichTextEditorHotKey.DECREASE_INDENT),
                    (_range: any, context: any) => {
                        let indent = context.format?.indent > 0 ? context.format?.indent - 1 : 0;
                        toolbar.handlers.indent.call(toolbar, indent);
                    },
                );
            }

            if (toolbar.container.querySelector('.ql-list')) {
                this.quill.keyboard.addBinding(
                    RichTextEditorHelper.getHotKeyConfig(RichTextEditorHotKey.BULLETED_LIST),
                    (_range: any, context: any) => {
                        toolbar.handlers.list.call(toolbar, context.format.list === 'bullet' ? '' : 'bullet');
                    },
                );

                this.quill.keyboard.addBinding(
                    RichTextEditorHelper.getHotKeyConfig(RichTextEditorHotKey.ORDERED_LIST),
                    (_range: any, context: any) => {
                        toolbar.handlers.list.call(toolbar, context.format.list === 'ordered' ? '' : 'ordered');
                    },
                );
            }

            if (toolbar.container.querySelector('.ql-strike')) {
                this.quill.keyboard.addBinding(
                    RichTextEditorHelper.getHotKeyConfig(RichTextEditorHotKey.STRIKE),
                    (_range: any, context: any) => {
                        toolbar.handlers.strike.call(toolbar, !context.format.strike);
                    },
                );
            }

            if (toolbar.container.querySelector('.ql-blockquote')) {
                this.quill.keyboard.addBinding(
                    RichTextEditorHelper.getHotKeyConfig(RichTextEditorHotKey.BLOCKQUOTE),
                    (_range: any, context: any) => {
                        toolbar.handlers.blockquote.call(toolbar, !context.format.blockquote);
                    },
                );
            }

            if (toolbar.container.querySelector('.ql-video')) {
                this.quill.keyboard.addBinding(
                    RichTextEditorHelper.getHotKeyConfig(RichTextEditorHotKey.VIDEO),
                    (_range: any) => {
                        // @ts-expect-error
                        toolbar.handlers.video.call(toolbar);
                    },
                );
            }

            if (toolbar.container.querySelector('.ql-image')) {
                this.quill.keyboard.addBinding(
                    RichTextEditorHelper.getHotKeyConfig(RichTextEditorHotKey.IMAGE),
                    (_range: any) => {
                        toolbar.handlers.image.call(toolbar, true);
                    },
                );
            }

            if (toolbar.container.querySelector('.ql-header')) {

                this.quill.keyboard.addBinding(
                    RichTextEditorHelper.getHotKeyConfig(RichTextEditorHotKey.HEADER),
                    (_range: any, context: any) => {
                        const headerSize = HEADER_SIZE_LIST.findIndex(item => item === context.format.header) + 1;
                        const header = headerSize < HEADER_SIZE_LIST.length ? HEADER_SIZE_LIST[headerSize] : HEADER_SIZE_LIST[0];
                        toolbar.handlers.header.call(toolbar, header);
                    },
                );
            }
        }
    }
}

export {IdeascaleSnowTheme};