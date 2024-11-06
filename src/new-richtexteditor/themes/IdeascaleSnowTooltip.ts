import VideoUtils from '../hyperlink-renderer/VideoUtils';
import {isValidUrl, LinkBlot} from '../blots/LinkBlot';
import SnowTooltip from 'quill/ui/tooltip';

class Range {
    constructor(public index: number, public length: number = 0) {
        this.index = index;
        this.length = length;
    }
}

class IdeascaleSnowTooltip extends SnowTooltip {
    textbox: any;
    preview: any;
    linkRange: any;
    static TEMPLATE: string;

    constructor(public quill: any, public boundsContainer: any) {
        super(quill, boundsContainer);
        this.boundsContainer = boundsContainer || this.quill.container || document.body;
        this.textbox = this.root.querySelector('input[type="text"]');
        this.listen();
        this.preview = this.root.querySelector('a.ql-preview');
    }


    listen() {
        this.textbox.addEventListener('keydown', (event: any) => {
            if (event.key === 'Enter') {
                this.save();
                event.preventDefault();
            } else if (event.key === 'Escape') {
                this.cancel();
                event.preventDefault();
            }
        });
        this.root.querySelector('a.ql-action')?.addEventListener('keyup', (event: any) => {
            if (event.key === 'Enter') {
                if (this.root.classList.contains('ql-editing')) {
                    this.save();
                } else {
                    this.edit('link', this.preview.textContent);
                }
                event.preventDefault();
            }
        });
        this.root.querySelector('a.ql-action')?.addEventListener('click', (event: any) => {
            if (this.root.classList.contains('ql-editing')) {
                this.save();
            } else {
                this.edit('link', this.preview.textContent);
            }
            event.preventDefault();
        });
        this.root.querySelector('a.ql-remove')?.addEventListener('keyup', (event: any) => {
            if (event.key === 'Enter') {
                if (this.linkRange != null) {
                    const range = this.linkRange;
                    this.restoreFocus();
                    this.quill.formatText(range, 'link', false, 'user');
                    delete this.linkRange;
                }
                event.preventDefault();
                this.hide();
            }
        });
        this.root.querySelector('a.ql-remove')?.addEventListener('click', (event: any) => {
            if (this.linkRange != null) {
                const range = this.linkRange;
                this.restoreFocus();
                this.quill.formatText(range, 'link', false, 'user');
                delete this.linkRange;
            }
            event.preventDefault();
            this.hide();
        });
        this.quill.on('selection-change', (range: any, _oldRange: any, source: any) => {
                if (range === null) return;
                if (range.length === 0 && source === 'user') {
                    const [link, offset] = this.quill.scroll.descendant(
                        LinkBlot,
                        range.index,
                    );
                    if (link !== null) {
                        // @ts-ignore
                        this.linkRange = new Range(range.index - offset, link.length());
                        const preview = LinkBlot.formats(link.domNode);
                        this.preview.textContent = preview;
                        this.preview.setAttribute('href', preview);
                        this.show();
                        this.position(this.quill.getBounds(this.linkRange));
                        return;
                    }
                } else {
                    delete this.linkRange;
                }
                this.hide();
            },
        );
    }

    hide() {
        super.hide();
        this.quill.container.style.overflow = '';
        this.clearError();
    }

    cancel() {
        this.hide();
    }

    resetTooltipTopPosition() {
        const resetTopId = setTimeout(() => {
            clearTimeout(resetTopId);
            const style = getComputedStyle(this.root);
            if (style && +style.top.replace('px', '') < 0) {
                (this.root as HTMLElement).style.top = '12px';
            }
        }, 0);
    }

    show() {
        super.show();
        this.quill.container.style.overflow = 'hidden';
        this.root.removeAttribute('data-mode');
        this.resetTooltipTopPosition();
    }

    edit(mode = 'link', preview = null) {
        this.quill.container.style.overflow = 'hidden';
        this.root.classList.remove('ql-hidden');
        this.root.classList.add('ql-editing');
        if (preview != null) {
            this.textbox.value = preview;
        } else if (mode !== this.root.getAttribute('data-mode')) {
            this.textbox.value = '';
        }
        this.position(this.quill.getBounds(this.quill.selection.savedRange));
        this.textbox.select();
        this.textbox.setAttribute(
            'placeholder',
            this.textbox.getAttribute(`data-${mode}`) || '',
        );
        this.root.setAttribute('data-mode', mode);
        this.resetTooltipTopPosition();
    }

    restoreFocus() {
        const scrollTop = this.quill.scrollingContainer ? this.quill.scrollingContainer.scrollTop : 0;
        this.quill.focus();
        if (this.quill.scrollingContainer) {
            this.quill.scrollingContainer.scrollTop = scrollTop;
        }
    }

    showError(errorMessage: any) {
        const errorElement = this.root.querySelector('div.ql-error');
        if (errorElement) {
            errorElement.innerHTML = errorMessage;
        }
    }

    clearError() {
        const errorElement = this.root.querySelector('div.ql-error');
        if (errorElement) {
            errorElement.innerHTML = '';
        }
    }

    save() {
        const {value} = this.textbox;
        const mode = this.root.getAttribute('data-mode');
        switch (mode) {
            case 'link': {
                if (!value || !isValidUrl(value)) {
                    this.showError('Please enter a valid url. Ex: https://ideascale.com');
                    return;
                }
                const {scrollTop} = this.quill.root;
                if (this.linkRange) {
                    this.quill.formatText(this.linkRange, 'link', value, 'user',);
                    delete this.linkRange;
                } else {
                    this.restoreFocus();
                    this.quill.format('link', value, 'user');
                }
                this.quill.root.scrollTop = scrollTop;
                break;
            }
            // @ts-ignore
            case 'video': {
                if (!VideoUtils.isValidVideoUrl(value)) {
                    this.showError('Invalid video url!');
                    return;
                }
            } // eslint-disable-next-line no-fallthrough
            case 'formula': {
                if (!value) break;
                const range = this.quill.getSelection(true);
                if (range != null) {
                    const index = range.index + range.length;
                    this.quill.insertEmbed(index, mode, value, 'user');
                    if (mode === 'formula') {
                        this.quill.insertText(index + 1, ' ', 'user');
                    }
                    this.quill.setSelection(index + 2, 'user');
                }
                break;
            }
            default:
        }
        this.textbox.value = '';
        this.hide();
    }
}

IdeascaleSnowTooltip.TEMPLATE = [
    '<a tabindex="0" class="ql-preview" rel="noopener noreferrer" target="_blank" href="about:blank">Link</a>',
    '<input type="text" aria-label="Input Link" data-formula="e=mc^2" data-link="https://ideascale.com" data-video="Embed URL">',
    '<span class="action-btn-container">',
    '<a tabindex="0" class="ql-action"></a>',
    '<a tabindex="0" class="ql-remove"></a>',
    '</span>',
    '<div class="ql-error text-warning"></div>',
].join('');

export {IdeascaleSnowTooltip};