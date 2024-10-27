import Quill, {Module} from "quill";
import {EmojiOptions} from "./model/emoji-options";
import Toolbar from "quill/modules/toolbar";
import data, {EmojiMartData} from '@emoji-mart/data';
import {Picker} from "emoji-mart";
import {Emoji} from "./model/emoji";

export class EmojiModule extends Module<Partial<EmojiOptions>> {

    private readonly toolbar: Toolbar;
    private readonly button: HTMLButtonElement | null;

    private picker?: HTMLElement;

    public constructor(quill: Quill, options: Partial<EmojiOptions>) {
        super(quill, {
            ...options,
            theme: 'light',
            data: data as EmojiMartData
        });

        this.toolbar = this.quill.getModule('toolbar') as Toolbar;
        this.button = this.toolbar.container?.querySelector('button.ql-emoji') ?? null;

        if (this.button) {
            this.button.innerHTML = '<svg viewbox="0 0 18 18"><circle class="ql-fill" cx="7" cy="7" r="1"></circle><circle class="ql-fill" cx="11" cy="7" r="1"></circle><path class="ql-stroke" d="M7,10a2,2,0,0,0,4,0H7Z"></path><circle class="ql-stroke" cx="9" cy="9" r="6"></circle></svg>';

            this.button.addEventListener('click', () => {
                if (!this.picker) {
                    this.openDialog();
                } else {
                    this.closeDialog();
                }
            });
        }
    }

    public openDialog() {
        if (!this.picker) {
            this.picker = new Picker({
                onEmojiSelect: (emoji: Emoji) => this.selectEmoji(emoji),
                onClickOutside: (event: MouseEvent) => this.onClickOutside(event),
                ...this.options,
            }) as unknown as HTMLElement;

            document.body.appendChild(this.picker);

            const rect = this.button?.getBoundingClientRect();
            if (rect) {
                this.picker.style.top = `${rect.top + 25}px`;
                this.picker.style.left = `${rect.left}px`;
            }

            this.picker.style.boxShadow = '0 4px 4px 0 rgba(0, 0, 0, 0.25)';
            this.picker.style.position = 'absolute';
            this.picker.style.zIndex = '1';
        }
    }

    private selectEmoji(emoji: Emoji): void {
        const emojiDelta = this.quill.insertText(
            this.quill.getSelection(true).index,
            emoji.native,
            'user'
        );

        this.closeDialog();

        // Set Input position after the emoji
        setTimeout(() => {
            this.quill.setSelection(this.quill.getSelection(true).index + emojiDelta.length());
        });
    }

    private onClickOutside(event: MouseEvent): void {
        // Only close if the Click did not happen on the Emoji-Button inside the Toolbar when it exists!
        if (!this.button || !(this.button === event.target ||
            (event.target instanceof Element && this.button.contains(event.target))
        )) {
            this.closeDialog();
        }
    }

    public closeDialog() {
        this.picker?.remove();
        this.picker = undefined;
    }
}
