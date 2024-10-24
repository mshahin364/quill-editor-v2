type BrowserProgressEvent = any;

interface AxiosProgressEvent {
    loaded: number;
    total?: number;
    progress?: number;
    bytes: number;
    rate?: number;
    estimated?: number;
    upload?: boolean;
    download?: boolean;
    event?: BrowserProgressEvent;
}

export type UploadProgressCallback = (progressEvent: AxiosProgressEvent) => void