import {ButtonHTMLAttributes, ReactNode, useMemo} from 'react';
import {Modal as BootstrapModal, ModalHeader} from 'reactstrap';
import {CommonUtil} from "../new-richtexteditor/utils/CommonUtil.ts";
import {KEYS} from "../types/CommonEnums.ts";
import {ActionButton} from "./ActionButton.tsx";


type ModalProps = {
    [key: string]: any;
    isOpen: boolean;
    children: ReactNode;
    toggle?: () => void;
    title?: ReactNode;
    scrollable?: boolean;
    className?: string;
    wrapClassName?: string;
    fullscreen?: boolean;
    modalBodyClassName?: string;
    modalFooterClassName?: string;
    customFooter?: ReactNode;
    closeOnEscape?: boolean;
    cancelButton?: {
        btnLabel: string;
        'data-test-element-id'?: string;
        btnProps?: ButtonHTMLAttributes<HTMLButtonElement>;
    }
    primaryButton?: {
        loading?: boolean;
        btnLabel: string;
        'data-test-element-id'?: string;
        btnProps?: ButtonHTMLAttributes<HTMLButtonElement>;
    };
    autoFocus?: boolean;
    trapFocus?: boolean | undefined;
    onEnter?: () => void;
    backdrop?: boolean | 'static';
    modalHeaderId?: string;
    modalBodyId?: string;
    size?: 'sm' | 'lg' | 'xl';
    showHeader?: boolean;
    showHeaderCloseButton?: boolean;
    zIndex?: number;
    onClosed?: () => void;
    modalClassName?: string;
} & Omit<React.HTMLAttributes<HTMLElement>, 'title'>;

export const Modal = (props: ModalProps) => {
    const {
        toggle,
        children,
        title = null,
        modalBodyClassName,
        modalFooterClassName,
        customFooter,
        cancelButton,
        modalHeaderId,
        modalBodyId,
        backdrop = 'static',
        primaryButton,
        size = '',
        closeOnEscape = true,
        showHeader = true,
        showHeaderCloseButton = true,
        trapFocus = true,
        zIndex,
        onClosed,
        modalClassName = '',
        wrapClassName = '',
        fullscreen = false,
        ...rest
    } = props;

    const headerId = useMemo(() => {
        return modalHeaderId || CommonUtil.uuid();
    }, []);

    const handleEscapeKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const additionalDialog = (e.target as Element).closest('.modal')?.querySelector('.additional-dialog-open');
        if (additionalDialog && e.key === KEYS.ESCAPE) {
            e.stopPropagation();
        }
    };

    return (
        <BootstrapModal {...rest} backdrop={backdrop} size={size} labelledBy={headerId}
                        toggle={closeOnEscape ? toggle : undefined} keyboard={closeOnEscape} trapFocus={trapFocus}
                        onClosed={onClosed} zIndex={zIndex} modalClassName={modalClassName}
                        wrapClassName={wrapClassName} fullscreen={fullscreen}>
            {
                showHeader && (title || toggle) &&
                <ModalHeader aria-hidden={!title} tag="div"
                             toggle={showHeaderCloseButton ? toggle : undefined} id={headerId}>
                    {
                        /*For Accessibility*/
                        title
                            ? typeof title === 'string'
                                ? <h2 className="h5 modal-title-text">{title}</h2>
                                : title
                            : <span className="sr-only">Modal</span>
                    }
                </ModalHeader>
            }
            <div
                onKeyUp={handleEscapeKey}
                className={`modal-body${modalBodyClassName ? ' ' + modalBodyClassName : ''}`}
                {...(modalBodyId ? {id: modalBodyId} : {})}
                {...(rest.scrollable ? {tabIndex: -1} : {})}>
                {children}
            </div>
            {
                customFooter
                    ? <div className={`modal-footer ${modalFooterClassName ? modalFooterClassName : ''}`}>
                        {customFooter}
                    </div>
                    :
                    (
                        (cancelButton || primaryButton) &&
                        <div className={`modal-footer ${modalFooterClassName ? modalFooterClassName : ''}`}>
                            {
                                cancelButton &&
                                <button className="btn btn-cancel"
                                        onClick={cancelButton.btnProps?.onClick ? cancelButton.btnProps.onClick : toggle} {...cancelButton.btnProps}
                                        data-test-element-id={cancelButton?.['data-test-element-id'] || 'cancel-button'}>
                                    {cancelButton.btnLabel}
                                </button>
                            }
                            {
                                primaryButton &&
                                <ActionButton loading={primaryButton.loading || false} {...primaryButton.btnProps}
                                              data-test-element-id={primaryButton?.['data-test-element-id'] || 'submit-button'}>
                                    {primaryButton.btnLabel}
                                </ActionButton>
                            }
                        </div>
                    )
            }
        </BootstrapModal>
    );
};
