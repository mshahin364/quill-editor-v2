import {ReactElement, RefObject} from 'react';
import {PopoverBody, PopoverHeader, UncontrolledPopover} from 'reactstrap';
import type {Placement} from '@popperjs/core';
import {Button} from './Button';

type InfoTipProps = {
    id: string;
    content: ReactElement | string;
    title?: string;
    placement?: Placement;
    container?: string | HTMLElement | RefObject<HTMLElement>;
    isDark?: boolean;
    size?: 'sm' | 'lg';
    instructions?: string;
    className?: string;
    btnClassName?: string;
}

export const InfoTip = ({
                            title,
                            content,
                            id,
                            container,
                            placement = 'auto',
                            isDark = false,
                            size = 'lg',
                            instructions,
                            className = '',
                            btnClassName = ''
                        }: InfoTipProps) => {
    return (
        <div className={`d-inline-block ${className}`} id={`${id}-container`} aria-live="assertive">
            <Button color="default" type="button"
                    className={`p-0 infotip ${isDark ? 'infotip-dark' : ''} ${size === 'sm' ? 'infotip-sm' : ''} ${btnClassName}`}
                    id={id}
                    title={instructions}
            >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"
                     viewBox="0 0 1024 1024" aria-hidden={true}>
                    <path fill="#999"
                          d="M464.8 276.004h94.398v94.398h-94.398zM464.8 464.8h94.398v283.195h-94.398zM512 40.008c-260.54 0-471.992 211.453-471.992 471.992s211.453 471.992 471.992 471.992 471.992-211.453 471.992-471.992-211.453-471.992-471.992-471.992zM512 889.594c-208.149 0-377.594-169.445-377.594-377.594s169.445-377.594 377.594-377.594 377.594 169.445 377.594 377.594-169.445 377.594-377.594 377.594z"/>
                </svg>
                <span className="sr-only">More information</span>
            </Button>
            <UncontrolledPopover container={container || `${id}-container`} placement={placement}
                                 className="infotip-container"
                                 trigger="legacy" target={id} aria-labelledby={id}>
                {title && <PopoverHeader>{title}</PopoverHeader>}
                <PopoverBody>{content}</PopoverBody>
            </UncontrolledPopover>
        </div>
    );
};
