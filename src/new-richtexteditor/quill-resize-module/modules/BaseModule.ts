export default class BaseModule {
	resizer: any;
	quill: any;
	overlay: any;
	activeEle: any;
	blot: any;
	options: any;
	requestUpdate: any;

	constructor(resizer: any) {
		this.resizer = resizer;
		this.quill = resizer.quill;
		this.overlay = resizer.overlay;
		this.activeEle = resizer.activeEle;
		this.blot = resizer.blot;
		this.options = resizer.options;
		this.requestUpdate = () => {
			resizer.onUpdate(true);
		};
	}

	// tslint:disable-next-line:no-empty
	onCreate() {
	}

	// tslint:disable-next-line:no-empty
	onDestroy() {
	}

	// tslint:disable-next-line:no-empty
	onUpdate() {
	}
}
