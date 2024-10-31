import {Button} from './Button';

type ActionButtonProps = {
	children: React.ReactNode;
	loading: boolean;
	className?: string;
	type?: 'button' | 'submit' | 'reset';
	disabled?: boolean;
	size?: string;
	'data-test-element-id'?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const ActionButton = (props: ActionButtonProps) => {
	const {
		children,
		loading,
		className,
		type,
		disabled,
		size,
		...rest
	} = props;

	return (
		<Button className={className} type={type} color="primary" size={size} disabled={loading || disabled} {...rest}>
			{
				loading &&
				<span className="spinner-border spinner-border-sm me-2 position-relative pos-top-n1"/>
			}
			{children}
		</Button>
	);
};