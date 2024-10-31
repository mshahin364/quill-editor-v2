import {useEffect, useRef, useState} from 'react';

export type DropFunction = (files: FileList) => void;

export type UseFileDropHookSpec = {
	drop: DropFunction;
};

type Returns = readonly [boolean, React.RefObject<HTMLDivElement>];

const fileExists = (event: DragEvent) => {
	return event.dataTransfer && event.dataTransfer.types.includes('Files');
};

const isElement = (value: any): value is Element => {
    return value instanceof Element;
};

export const useFileDrop = (props: UseFileDropHookSpec) => {
	const {drop} = props;
	const [canDrop, setCanDrop] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const element = ref.current;
		const onDragOver = (e: DragEvent) => {
			e.preventDefault();
			if (fileExists(e)) {
				setCanDrop(true);
			}
		};
		const onDragLeave = (e: DragEvent) => {
            e.preventDefault();
            if (fileExists(e) && isElement(e.currentTarget) && isElement(e.relatedTarget)) {
                if (e.currentTarget.contains(e.relatedTarget)) {
                    return;
                }
                setCanDrop(false);
            }
		};
		const onDrop = (e: DragEvent) => {
			e.preventDefault();
			if (fileExists(e)) {
				drop(e.dataTransfer!.files);
				setCanDrop(false);
			}
		};
		if (element) {
			element.addEventListener('dragover', onDragOver);
			element.addEventListener('dragleave', onDragLeave);
			element.addEventListener('drop', onDrop);
		}
		return () => {
			if (element) {
				element.removeEventListener('dragover', onDragOver);
				element.removeEventListener('dragleave', onDragLeave);
				element.removeEventListener('drop', onDrop);
			}
		};
	}, [drop]);

	return [canDrop, ref] as Returns;
};