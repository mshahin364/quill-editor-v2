import {ForwardedRef, forwardRef, Fragment, memo, MouseEvent} from 'react';
import {Icon} from './Icon';
import {FileError} from "../types/FileError.ts";
import {useFileDrop} from "../utils/use-file-drop.ts";

const DEFAULT_MAX_FILE_NO = 5;
const DEFAULT_FILE_SIZE = -1;

type FileInputProps = {
    labels: {
        dragAndDrop: string,
        browseFile: string,
        dropFile: string,
        or: string,
        uploadInstruction?: string,
        classification?: string,
        classificationType?: string
    }
    onSuccess: (files: FileList) => void;
    onError: (errors: FileError) => void;
    svgIconPath: string;
    maxSizeInMB?: number;
    inputId?: string;
    multiple?: boolean;
    maxFileNumber?: number;
    onClick?: (event: MouseEvent<HTMLInputElement>) => void;
    onClassificationError?: (errors: FileError) => void;
    hasClassification?: boolean;
    autofocus?: boolean;
    hasError?: boolean;
}

const FileInputCore = memo(forwardRef((props: FileInputProps, ref: ForwardedRef<HTMLInputElement>) => {
    const {
        onSuccess,
        onError,
        svgIconPath,
        labels,
        inputId,
        multiple,
        maxSizeInMB = DEFAULT_FILE_SIZE,
        maxFileNumber = DEFAULT_MAX_FILE_NO,
        onClick,
        onClassificationError,
        hasClassification = undefined,
        autofocus = false,
        hasError = false
    } = props;

    const [canDrop, dropRef] = useFileDrop({
        drop: (files) => {
            if (files) {
                onFileChange(files);
            }
        }
    });

    const validateFiles = (files: FileList) => {
        const fileList = Array.from(files);
        let error: FileError;
        if (!multiple && files.length > 1) {
            error = {type: 'multipleNotAllowed'};
            return error;
        }
        if (multiple && files.length > maxFileNumber) {
            error = {
                type: 'maxFileNumberExceeded',
                amount: maxFileNumber !== undefined ? maxFileNumber : DEFAULT_MAX_FILE_NO
            };
            return error;
        }
        if (maxSizeInMB > 0) {
            for (const file of fileList) {
                if (file.size > (maxSizeInMB * 1024 * 1024)) {
                    error = {type: 'maxSizeExceeded', file};
                    return error;
                }
            }
        }
        return;
    };

    const onFileChange = (files: FileList) => {
        if (hasClassification !== undefined && !hasClassification) {
            return onClassificationError?.({type: 'classificationRequired', event: 'DropEvent'});
        }

        const error = validateFiles(files);
        if (error) {
            onError(error);
        } else {
            onSuccess(files);
        }
    };

    return (
        <div className={`file-upload-container ${(canDrop) ? 'drag-over' : ''} ${hasError ? 'has-error' : ''}`}
             ref={dropRef}>
            <label className="file-upload-label form-control h-auto">
                {labels.classification && <span
                    className={`me-2 classification-label classification-label-${labels.classificationType ? labels.classificationType.toLowerCase() : ''}`}> {labels.classification}</span>}
                <Icon
                    className="upload-icon active"
                    name="arrow-up-solid-cloud"
                    width={18} height={19}
                    fill="#384EC1"
                    iconSpritePath={svgIconPath}/>
                {' '}<strong>{labels.browseFile}</strong>{' '}<span
                className="d-none d-lg-inline-block">{labels.or}</span>{' '}<strong
                className="d-none d-lg-inline-block">{labels.dragAndDrop}</strong>
                <input
                    autoFocus={autofocus}
                    className="sr-only"
                    id={inputId}
                    type="file"
                    multiple={multiple}
                    ref={ref}
                    onClick={(event) => {
                        if (hasClassification !== undefined && !hasClassification) {
                            onClassificationError?.({type: 'classificationRequired', event: event});
                        }

                        onClick && onClick(event);
                        (event.target as HTMLInputElement).value = '';
                    }}
                    onChange={(event) => {
                        if (event.target.files) {
                            onFileChange(event.target.files);
                        }
                    }}/>
            </label>
            {
                (labels.dropFile && labels.dropFile.length > 0) && (
                    <label className="file-drop-label">{labels.dropFile}</label>
                )
            }
        </div>
    );
}));

export const FileInput = forwardRef((props: FileInputProps, ref: ForwardedRef<HTMLInputElement>) => {
    const {
        onSuccess,
        onError,
        svgIconPath,
        labels,
        inputId,
        multiple,
        maxSizeInMB = DEFAULT_FILE_SIZE,
        maxFileNumber,
        onClick,
        onClassificationError,
        hasClassification,
        autofocus = false,
        hasError = false,
    } = props;

    return (
        <Fragment>
            <FileInputCore labels={labels} inputId={inputId} multiple={multiple} onSuccess={onSuccess}
                           onError={onError} maxSizeInMB={maxSizeInMB} maxFileNumber={maxFileNumber}
                           svgIconPath={svgIconPath} ref={ref} onClick={onClick}
                           hasError={hasError} onClassificationError={onClassificationError}
                           hasClassification={hasClassification} autofocus={autofocus}/>
            {labels.uploadInstruction && maxSizeInMB > 0 &&
                <div className="form-text text-muted">
                    <span className="text-warning">{labels.uploadInstruction} {maxSizeInMB} MB</span>
                </div>
            }
        </Fragment>
    );
});