import {Button as BootstrapButton} from 'reactstrap';
import {ButtonHTMLAttributes, ElementType, KeyboardEvent, MouseEvent, ReactNode} from 'react';

type ButtonColor =
    'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'light'
    | 'dark'
    | 'secondary-danger'
    | 'secondary-primary';

type ButtonProps = {
    [key: string]: any;
    tag?: ElementType;
    className?: string;
    color?: string | ButtonColor;
    size?: string;
    children: ReactNode;
    disabled?: boolean;
    active?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = (props: ButtonProps) => {
    const {
        tag,
        className = '',
        color = 'primary',
        size,
        children,
        disabled,
        active,
        onKeyDown,
        ...restAttributes
    } = props;

    const handleOnClick = (event: MouseEvent<HTMLButtonElement>): void => {
        disabled ? event.preventDefault() : restAttributes.onClick?.(event);
    };

    const handleOnKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (disabled && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
        } else {
            onKeyDown && onKeyDown(event);
        }
    };

    return (
        <BootstrapButton tag={tag}
                         className={disabled ? `${className} disabled` : className}
                         aria-disabled={disabled}
                         color={color}
                         size={size}
                         active={active}
                         onKeyDown={handleOnKeyDown}
                         {...(restAttributes.onClick ? {onClick: handleOnClick} : {})}
                         {...restAttributes}>
            {children}
        </BootstrapButton>
    );
};
