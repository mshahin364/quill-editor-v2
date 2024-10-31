import {MouseEvent} from 'react';

export type FileError =
    { type: 'multipleNotAllowed' }
    | { type: 'maxSizeExceeded', file: File }
    | { type: 'maxFileNumberExceeded', amount: number }
    | { type: 'classificationRequired', event: MouseEvent<HTMLInputElement> | 'DropEvent' };