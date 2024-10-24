import Quill from 'quill';
import Resize from './QuillResize';
import {Image} from './formats/image';
import PlaceholderRegister from './formats/placeholder';

Quill.register(Image, true);

export {
	EmbedPlaceholder,
	TagPlaceholder,
	ClassNamePlaceholder,
	convertPlaceholderHTML
} from './formats/placeholder';

export default Resize;
export {Resize, Image, PlaceholderRegister};
