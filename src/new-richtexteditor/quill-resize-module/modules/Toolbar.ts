import Quill from 'quill';

const Parchment = Quill.import('parchment');
import BaseModule from './BaseModule';

const ClassAttributor = Parchment.ClassAttributor;
const ImageFormatClass = new ClassAttributor('imagestyle', 'ql-resize-style');

export default class Toolbar extends BaseModule {
    toolbar: any;
    alignments: any;

    onCreate() {
        // Setup Toolbar
        this.toolbar = document.createElement('div');
        Object.assign(this.toolbar.style, this.options.styles.toolbar);
        this.overlay.appendChild(this.toolbar);

        // Setup Buttons
        this._defineAlignments();
        this._addToolbarButtons();
    }

    _defineAlignments() {
        this.alignments = [
            {
                icon: `<svg class="left-align" viewbox="0 0 18 18">
                    <line class="ql-stroke" x1="3" x2="15" y1="9" y2="9"/>
                    <line class="ql-stroke" x1="3" x2="13" y1="14" y2="14"/>
                    <line class="ql-stroke" x1="3" x2="9" y1="4" y2="4"/>
                </svg>`,
                apply: () => {
                    ImageFormatClass.add(this.activeEle, 'left');
                },
                isApplied: () => ImageFormatClass.value(this.activeEle) === 'left'
            },
            {
                icon: `<svg class="center-align" viewbox="0 0 18 18">
                    <line class="ql-stroke" x1="15" x2="3" y1="9" y2="9"/>
                    <line class="ql-stroke" x1="14" x2="4" y1="14" y2="14"/>
                    <line class="ql-stroke" x1="12" x2="6" y1="4" y2="4"/>
                </svg>`,
                apply: () => {
                    ImageFormatClass.add(this.activeEle, 'center');
                },
                isApplied: () => ImageFormatClass.value(this.activeEle) === 'center'
            },
            {
                icon: `<svg class="right-align" viewbox="0 0 18 18">
                <line class="ql-stroke" x1="15" x2="3" y1="9" y2="9"/>
                <line class="ql-stroke" x1="15" x2="5" y1="14" y2="14"/>
                <line class="ql-stroke" x1="15" x2="9" y1="4" y2="4"/>
            </svg>`,
                apply: () => {
                    ImageFormatClass.add(this.activeEle, 'right');
                },
                isApplied: () => ImageFormatClass.value(this.activeEle) === 'right'
            }
        ];
    }

    _addToolbarButtons() {
        const buttons: any[] = [];
        this.alignments.forEach((alignment: any, idx: any) => {
            // tslint:disable-next-line:no-shadowed-variable
            const button: any = document.createElement('span');
            buttons.push(button);
            button.innerHTML = alignment.icon;
            button.addEventListener('click', () => {
                // deselect all buttons
                // tslint:disable-next-line:no-shadowed-variable
                buttons.forEach((button: any) => (button.style.filter = ''));
                if (alignment.isApplied()) {
                    // If applied, unapply
                    ImageFormatClass.remove(this.activeEle);
                } else {
                    // otherwise, select button and apply
                    this._selectButton(button);
                    alignment.apply();
                }
                // image may change position; redraw drag handles
                this.requestUpdate();
            });
            Object.assign(button.style, this.options.styles.toolbarButton);
            if (idx > 0) {
                button.style.borderLeftWidth = '0';
            }
            if (button.children && button.children.length > 0) {
                Object.assign(
                    button.children[0].style,
                    this.options.styles.toolbarButtonSvg
                );
            }
            if (alignment.isApplied()) {
                // select button if previously applied
                this._selectButton(button);
            }
            this.toolbar.appendChild(button);
        });
    }

    _selectButton(button: any) {
        button.style.filter = 'invert(20%)';
    }
}
