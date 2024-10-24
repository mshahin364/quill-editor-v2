export class FileUploadResponse {
    static readonly EMPTY = new FileUploadResponse({name: ''}, "", -1, "");

    constructor(
        public file: { name: string },
        public originalFilename: string,
        public responseCode: number,
        public responseMsg: string
    ) {
    }
}