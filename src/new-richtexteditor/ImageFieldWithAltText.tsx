import {UploadedResponse} from './UploadResponse';
import {InfoTip} from "../components/InfoTip.tsx";
import {Icon} from "../components/Icon.tsx";


type ImageFieldWithAltTextCommonProps = {
    id: string;
    attachment: UploadedResponse;
    attachmentIndex: number;
    svgIconPath: string;
    errorMessage?: string;
    onImageError?: () => void;
    onImageLoad?: () => void;
}

type ImageLink = {
    imageLink: true;
    onDeleteAttachment?: never;
    onAltTextChange: (altText: string) => void;
}

type AttachmentImage = {
    imageLink: false;
    onDeleteAttachment: (attachmentIndex: number) => void;
    onAltTextChange: (attachmentIndex: number, altText: string) => void;
}

type ImageFieldWithAltTextProps = ImageFieldWithAltTextCommonProps & (ImageLink | AttachmentImage)

const ALT_TEXT_LABEL = 'Alt Text';
const ALT_TEXT_INFOTIP_TEXT = 'Alt text (alternative text) describes the function or appearance of an image on a page';

export const ImageFieldWithAltText = (props: ImageFieldWithAltTextProps) => {
    const {
        attachmentIndex,
        attachment,
        onAltTextChange,
        onDeleteAttachment,
        svgIconPath,
        imageLink,
        errorMessage,
        id,
        onImageError,
        onImageLoad
    } = props;

    return (
        <div
            className={`d-flex text-break align-items-center mt-2 position-relative border-1 image-attachment ${errorMessage ? 'has-error' : ''}`}
            key={id}>
            <div className="w-20 py-4 mb-md-0 d-flex justify-content-center">
                <img className="rounded" src={attachment.url} width={60} onError={onImageError} onLoad={onImageLoad}
                     alt={attachment.altText}/>
            </div>
            <div className="w-100 p-3 ps-md-0">
                <div className="row flex-column flex-md-row">
                    <div className={`mb-0 col`}>
                        <label className="control-label fw-bold my-1" htmlFor="altText">
                            {ALT_TEXT_LABEL}
                            <InfoTip id="infotip-upload-file-alt-text" placement="top"
                                     content={ALT_TEXT_INFOTIP_TEXT}/>
                        </label>
                        <input className="form-control" type="text" id={`${id}-altText`}
                               value={attachment.altText || ''} maxLength={255}
                               onChange={(event) => {
                                   if (imageLink) {
                                       onAltTextChange(event.target.value);
                                   } else {
                                       onAltTextChange(attachmentIndex, event.target.value);
                                   }
                               }}/>
                        {
                            !!errorMessage &&
                            <div className="invalid-feedback d-block">
                                {errorMessage}
                            </div>
                        }
                    </div>
                </div>
            </div>
            {
                !imageLink &&
                <button className="btn btn-cancel p-0 z-index-4" type="button"
                        onClick={() => onDeleteAttachment(attachmentIndex)}>
                    <Icon iconSpritePath={svgIconPath} name="cross" width={10} height={10}/>
                </button>
            }
        </div>
    );
};