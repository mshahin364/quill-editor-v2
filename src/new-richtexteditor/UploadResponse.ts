export class UploadedResponse {
	static readonly EMPTY = new UploadedResponse('', '', '', '');

	constructor(
		public originalFileName: string,
		public filename: string,
		public url: string,
		public altText: string
	) {
	}
}