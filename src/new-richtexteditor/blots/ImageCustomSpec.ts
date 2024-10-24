import {DeleteAction, ImageSpec, ResizeAction} from 'quill-blot-formatter';

export class CustomImageSpec extends ImageSpec {
	getActions() {
		return [ResizeAction, DeleteAction];
	}
}