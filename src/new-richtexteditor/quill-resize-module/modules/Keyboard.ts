import BaseModule from './BaseModule';

export default class Keyboard extends BaseModule {
	// keys: any;
	static keys: { DOWN: number; DELETE: number; TAB: number; LEFT: number; ENTER: number; RIGHT: number; BACKSPACE: number; UP: number; ESCAPE: number };

	static injectInit(quill: any) {
		// left/right
		const bindings = quill.keyboard.bindings;
		// @ts-ignore
		bindings[this.keys.LEFT]?.unshift(
			// @ts-ignore
			this.makeArrowHandler(this.keys.LEFT, false)
		);
		// @ts-ignore
		bindings[this.keys.RIGHT]?.unshift(
			// @ts-ignore
			this.makeArrowHandler(this.keys.RIGHT, false)
		);
	}

	static makeArrowHandler(key: any, shiftKey: any) {
		// @ts-ignore
		const where = key === Keyboard.keys.LEFT ? 'prefix' : 'suffix';
		return {
			key,
			shiftKey,
			altKey: null,
			[where]: /^$/,
			handler(range: any) {
				if (!this.quill.resizer) return true;

				let index = range.index;

				// check end of line
				const [line] = this.quill.getLine(range.index);
				const lineIndex = this.quill.getIndex(line);
				// @ts-ignore
				if (key === Keyboard.keys.RIGHT && lineIndex + line.length() - 1 === index) return true;

				// get leaf/offset
				// @ts-ignore
				if (key === Keyboard.keys.RIGHT) {
					index += (range.length + 1);
				}
				let [leaf] = this.quill.getLeaf(index);
				const offset = leaf?.offset(leaf.parent);

				// check start of line
				// @ts-ignore
				if (key === Keyboard.keys.LEFT && (index === 0 || index === lineIndex)) return true;

				// get previous leaf
				// @ts-ignore
				if (key === Keyboard.keys.LEFT) {
					if (offset && offset === 0) {
						index -= 1;
						leaf = this.quill.getLeaf(index)[0];
					}
				}

				return !this.quill.resizer.judgeShow(leaf);
			}
		};
	}

	// @ts-ignore
	onCreate() {
		// @ts-ignore
		this.keyboardProxy = evt => this.keyboardHandle(evt);
		// @ts-ignore
		document.addEventListener('keydown', this.keyboardProxy, true);
	}

	onDestroy() {
		// @ts-ignore
		document.removeEventListener('keydown', this.keyboardProxy, true);
	}

	keyboardHandle(evt: any) {
		if (evt.defaultPrevented) return;
		if (evt.shiftKey || evt.ctrlKey || evt.altKey) {
			return;
		}
		if (!this.activeEle || evt.fromResize || evt.ctrlKey) return;

		const code = evt.keyCode;
		let index = this.blot.offset(this.quill.scroll);
		let nextBlot;
		let handled = false;

		// delete
		// @ts-ignore
		if (code === Keyboard.keys.BACKSPACE || code === Keyboard.keys.DELETE) {
			this.blot.deleteAt(0);
			this.blot.parent.optimize();
			handled = true;

			// direction key
			// @ts-ignore
		} else if (code >= Keyboard.keys.LEFT && code <= Keyboard.keys.DOWN) {
			// @ts-ignore
			if (code === Keyboard.keys.RIGHT) {
				index++;
				// @ts-ignore
			} else if (code === Keyboard.keys.UP) {
				index = this.getOtherLineIndex(-1);
				nextBlot = this.quill.getLeaf(index)[0];
				// @ts-ignore
			} else if (code === Keyboard.keys.DOWN) {
				index = this.getOtherLineIndex(1);
				nextBlot = this.quill.getLeaf(index)[0];
			}
			handled = true;
		}

		if (handled) {
			evt.stopPropagation();
			evt.preventDefault();
		}

		if (nextBlot && this.resizer.judgeShow(nextBlot, nextBlot.domNode)) return;

		this.quill.setSelection(index);
		this.resizer.hide();
	}

	getOtherLineIndex(dir: any) {
		let index = this.blot.offset(this.quill.scroll);
		const [line] = this.quill.getLine(index);
		const lineIndex = this.blot.offset(line) + 1;

		const otherLine = dir > 0 ? line.next : line.prev;

		if (otherLine) {
			let len = otherLine.length();
			if (otherLine.statics.blotName === 'block') len--;
			index = otherLine.offset(this.quill.scroll) + Math.min(len, lineIndex);
		}

		return index;
	}

	dispatchEvent(evt: any) {
		const event = new evt.constructor(evt);
		event.fromResize = true;
		this.quill.root.dispatchEvent(event);
	}
}

Keyboard.keys = {
	BACKSPACE: 8,
	TAB: 9,
	ENTER: 13,
	ESCAPE: 27,
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	DELETE: 46
};
