import {useCallback, useEffect, useRef, useState} from 'react';
import Quill from 'quill';
import {Nav, NavItem, Progress, TabContent, TabPane} from 'reactstrap';
import useTabToggle from './useTabToggle';
import {UploadProgressCallback} from './UploadProgressCallback';
import {UploadedResponse} from './UploadResponse';
import {HtmlConverter} from './utils/HtmlConverter';
import {ImageFieldWithAltText} from './ImageFieldWithAltText';
import {Modal} from "../components/Modal.tsx";
import {CommonUtil} from "./utils/CommonUtil.ts";
import {Button} from "../components/Button.tsx";
import {FileInput} from "../components/FileInput.tsx";
import {FileError} from "../types/FileError.ts";

type ImageUploadModalProps = {
    open: boolean;
    toggle: () => void;
    svgIconPath: string;
    getQuill: () => Quill | undefined;
    onSelectAttachment: (attachment: string, altText?: string) => void;
    existingAttachments?: string[];
    uploadImage?: (data: FormData, onUploadProgress: UploadProgressCallback) => Promise<UploadedResponse>;
    maxFileSize?: number;
    externalFileBasePath: string;
    enableExternalImageEmbedOption: boolean;
}

const INPUT_ID = 'editor-file-upload';
const EMPTY_FILE_MESSAGE = 'Please upload an image!';
const EMPTY_LINK_MESSAGE = 'Please add a valid image link!';
const INVALID_FILE_MESSAGE = 'File type is not supported!';
const INVALID_LINK_MESSAGE = 'Invalid image link!';
const HTML_TAGS_NOT_ALLOWED = 'HTML tags not allowed.';
const LINK_IMAGE_WARNING_MESSAGE = 'The image link will not work if the source file is deleted';
const MULTIPLE_DROP_LIMIT_TEXT = 'No more than 1 files are permitted to be uploaded at a time';
const UNKNOWN_ERROR = 'Oops, an unknown error happened when uploading the idea\'s attachment.';

const ERROR_REASON: Record<string, string> = {
    UPLOAD_FAILED: 'File upload failed. Please try again.'
};

export const ImageUploadAndLinkModal = (props: ImageUploadModalProps) => {
    const {
        open,
        toggle,
        svgIconPath,
        onSelectAttachment,
        uploadImage,
        maxFileSize,
        externalFileBasePath,
        enableExternalImageEmbedOption
    } = props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, onToggleTab] = useTabToggle('tab-1');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [attachments, setAttachments] = useState<UploadedResponse[]>([]);
    const [attachmentAltTextErrorMessages, setAttachmentAltTextErrorMessages] = useState<string[]>([]);
    const [validationFileMsg, setValidationFileMsg] = useState<string | null>(null);

    const [validationLinkMsg, setValidationLinkMsg] = useState<string | null>(null);
    const [linkImageAltTextErrorMessage, setLinkImageAltTextErrorMessage] = useState('');
    const [linkImage, setLinkImage] = useState<UploadedResponse>(UploadedResponse.EMPTY);

    const [uploadQueueInfo, setUploadQueueInfo] = useState<Map<string, number>>(new Map());
    const addLinkRef = useRef<HTMLInputElement>(null);

    const uploadQueueSize = uploadQueueInfo.size;
    const totalPercentage = Array.from(uploadQueueInfo.values())
        .reduce((accumulatedPercentage, percentage) => accumulatedPercentage + percentage, 0);
    const averagePercentageCompleted = totalPercentage / uploadQueueSize;

    const updateUploadQueue = useCallback((progressInfo: { fileName: string, percent: number }) => {
        setUploadQueueInfo(prevProgressInfo => new Map(prevProgressInfo.set(progressInfo.fileName, progressInfo.percent)));
    }, []);

    useEffect(() => {
        setTimeout(() => fileInputRef.current?.focus());
    }, []);

    const removeAttachments = useCallback((index: number) => {
        const newAttachments = [...attachments];
        newAttachments.splice(index, 1);
        setAttachments(newAttachments);
    }, [attachments]);

    const onAttachmentAltTextChange = useCallback((index: number, altText: string) => {
        setAttachments(prev => {
            if (prev.length > 0) {
                prev[index].altText = altText;
            }
            return prev.slice();
        });
    }, []);

    const onImageLinkAltTextChange = useCallback((altText: string) => {
        setLinkImage(prev => {
            prev.altText = altText;
            return {...prev};
        });
    }, []);

    return (
        <Modal
            autoFocus
            className="modal-lg"
            isOpen={open} toggle={toggle} title="Add image"
            cancelButton={{btnLabel: 'Cancel'}}
            primaryButton={{
                btnLabel: 'Add',
                btnProps: {
                    type: 'button',
                    disabled: (activeTab === 'tab-1' && uploadQueueSize > 0) || (activeTab === 'tab-2' && validationLinkMsg && validationLinkMsg.length > 0) || false,
                    onClick: async () => {
                        if (activeTab === 'tab-1') {
                            if (attachments.length > 0) {
                                if (attachments[0].altText && CommonUtil.isHtmlInject(attachments[0].altText)) {
                                    setAttachmentAltTextErrorMessages(prev => {
                                        prev[0] = HTML_TAGS_NOT_ALLOWED;
                                        return prev.slice();
                                    });
                                    return;
                                } else {
                                    setAttachmentAltTextErrorMessages([]);
                                }
                                setValidationFileMsg(null);
                                onSelectAttachment(attachments[0].url, attachments[0].altText?.trim() || attachments[0].filename);
                                setAttachments([]);
                                toggle();
                            } else {
                                setValidationFileMsg(EMPTY_FILE_MESSAGE);
                            }
                        } else if (activeTab === 'tab-2') {
                            if (validationLinkMsg === null && linkImage && linkImage.url.length > 0) {
                                if (linkImage.altText && CommonUtil.isHtmlInject(linkImage.altText)) {
                                    setLinkImageAltTextErrorMessage(HTML_TAGS_NOT_ALLOWED);
                                    return;
                                } else {
                                    setLinkImageAltTextErrorMessage('');
                                }
                                setValidationLinkMsg(null);
                                const requestUrl = HtmlConverter.createExternalImageUrl(linkImage.url, externalFileBasePath);
                                onSelectAttachment(requestUrl, linkImage.altText);
                                setLinkImage({...UploadedResponse.EMPTY, url: ''});
                                toggle();
                            } else if (linkImage.url.length === 0) {
                                setValidationLinkMsg(EMPTY_LINK_MESSAGE);
                            }
                        }
                    },
                }
            }}>
            {
                enableExternalImageEmbedOption &&
                <Nav pills={true} className="nav-tabs nav-pills-loose">
                    <NavItem>
                        <Button color={activeTab === 'tab-1' ? 'primary' : 'link'}
                                className="fw-normal"
                                onClick={() => {
                                    onToggleTab('tab-1');
                                    setTimeout(() => {
                                        fileInputRef.current?.focus();
                                    }, 100);
                                }}> Upload </Button>
                    </NavItem>

                    <NavItem>
                        <Button
                            color={activeTab === 'tab-2' ? 'primary' : 'link'}
                            onClick={() => {
                                onToggleTab('tab-2');
                                setTimeout(() => {
                                    addLinkRef.current?.focus();
                                }, 100);
                            }}> Add Links </Button>
                    </NavItem>
                </Nav>
            }

            <TabContent activeTab={activeTab} className="mt-3">
                <TabPane tabId={'tab-1'} className={'react-file-uploader'}>
                    <div className={`form-group ${validationFileMsg ? 'has-error' : ''}`}>
                        <FileInput
                            inputId={INPUT_ID} ref={fileInputRef} svgIconPath={svgIconPath}
                            multiple={false}
                            maxSizeInMB={maxFileSize}
                            labels={{
                                dragAndDrop: 'Drag & Drop',
                                browseFile: 'Browse File',
                                dropFile: 'Drop file here',
                                uploadInstruction: 'Maximum upload size',
                                or: 'or'
                            }}
                            onError={(error: FileError) => {
                                switch (error.type) {
                                    case 'maxSizeExceeded':
                                        setValidationFileMsg(`Maximum upload size of ${maxFileSize} MB exceeded!`);
                                        break;
                                    case 'multipleNotAllowed':
                                        setValidationFileMsg(MULTIPLE_DROP_LIMIT_TEXT);
                                        break;
                                    default:
                                        setValidationFileMsg(UNKNOWN_ERROR);
                                }
                            }}
                            onSuccess={async (files) => {
                                if (files.length < 1 || !files[0]) return;
                                setValidationFileMsg(null);
                                setErrorMessage(null);
                                const file = files[0];

                                if ((!/.*\.(gif|bmp|png|jpe?g)$/gmi.test(file.name))) {
                                    setValidationFileMsg(INVALID_FILE_MESSAGE);
                                    return;
                                }
                                if (uploadImage) {
                                    const fileName = file.name;
                                    const formData = new FormData();
                                    formData.append('file', file);

                                    try {
                                        const fileUploadResponse = await uploadImage(formData, (progressEvent) => {
                                            const percentCompleted = Math.ceil(progressEvent.loaded / (progressEvent.total || 1) * 100);
                                            updateUploadQueue({fileName, percent: percentCompleted});
                                        });

                                        if (fileUploadResponse) {
                                            setAttachments(() => [fileUploadResponse]);
                                            setAttachmentAltTextErrorMessages([]);
                                        }

                                        setUploadQueueInfo(prevProgressInfo => {
                                            const newQueueInfo = new Map(prevProgressInfo);
                                            newQueueInfo.delete(fileName);
                                            return newQueueInfo;
                                        });
                                    } catch (e: any) {
                                        if (e?.status && e?.status === 400) {
                                            setErrorMessage(ERROR_REASON[e?.data?.reason] ?? ERROR_REASON['UPLOAD_FAILED']);
                                        } else {
                                            const {message} = (e as Error) || {};
                                            setErrorMessage(message ?? ERROR_REASON['UPLOAD_FAILED']);
                                        }
                                    }
                                }
                            }}/>
                        {
                            (uploadQueueSize > 0 && !errorMessage) &&
                            <Progress value={averagePercentageCompleted} max={100} barClassName="progressbar"
                                      className="progressbar-track mt-1">
                                Uploading...
                            </Progress>
                        }
                        <div>
                            {
                                errorMessage && (
                                    <span className="is-invalid-label d-inline-block mt-2">{errorMessage}</span>
                                )
                            }
                            {
                                validationFileMsg && (
                                    <span className="is-invalid-label d-inline-block mt-2">{validationFileMsg}</span>
                                )
                            }
                        </div>
                        {
                            uploadQueueSize === 0 && attachments.length > 0 && attachments.map((attachment, attachmentIndex) =>
                                <ImageFieldWithAltText key={attachmentIndex}
                                                       attachment={attachment}
                                                       svgIconPath={svgIconPath}
                                                       id={`tab-1-image-${attachmentIndex}`}
                                                       imageLink={false}
                                                       errorMessage={attachmentAltTextErrorMessages[attachmentIndex]}
                                                       attachmentIndex={attachmentIndex}
                                                       onDeleteAttachment={removeAttachments}
                                                       onAltTextChange={onAttachmentAltTextChange}/>
                            )
                        }
                    </div>
                </TabPane>
                {
                    enableExternalImageEmbedOption &&
                    <TabPane tabId={'tab-2'}>
                        <div className="form-group">
                            <div className={`form-group ${validationLinkMsg ? 'has-error' : ''}`}>
                                <span className="text-warning">{LINK_IMAGE_WARNING_MESSAGE}</span>
                                <input type="url" value={linkImage.url || ''} className="form-control mt-2"
                                       placeholder="Add links"
                                       aria-label="Add links"
                                       onChange={(event) => {
                                           setValidationLinkMsg(null);
                                           if (!CommonUtil.isValidUrl(event.target.value)) {
                                               setValidationLinkMsg(INVALID_LINK_MESSAGE);
                                           }
                                           setLinkImage(prev => ({...prev, url: event.target.value}));
                                       }}/>
                                {
                                    validationLinkMsg && (
                                        <span className="is-invalid-label d-inline-block mt-2">{validationLinkMsg}</span>
                                    )
                                }
                                {
                                    CommonUtil.isValidUrl(linkImage.url) && !validationLinkMsg &&
                                    <ImageFieldWithAltText imageLink={true}
                                                           id="tab-2-image"
                                                           onImageError={() => setValidationLinkMsg(INVALID_LINK_MESSAGE)}
                                                           onImageLoad={() => {
                                                               setValidationLinkMsg(null);
                                                               setLinkImageAltTextErrorMessage('');
                                                           }}
                                                           attachment={linkImage}
                                                           svgIconPath={svgIconPath}
                                                           errorMessage={linkImageAltTextErrorMessage}
                                                           attachmentIndex={0}
                                                           onAltTextChange={onImageLinkAltTextChange}/>
                                }
                            </div>
                        </div>
                    </TabPane>
                }
            </TabContent>
        </Modal>
    );
};