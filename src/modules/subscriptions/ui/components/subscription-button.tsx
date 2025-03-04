import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubscriptionButtonProps {
	onClick: ButtonProps['onClick'];
	size?: ButtonProps['size'];
	isSubscribed: boolean;
	disabled?: boolean;
	className?: string;
}
export const SubscriptionButton = ({
	disabled,
	isSubscribed,
	onClick,
	size,
	className,
}: SubscriptionButtonProps) => {
	return (
		<Button
			size={size}
			variant={isSubscribed ? 'secondary' : 'default'}
			className={cn('rounded-full', className)}
			onClick={onClick}
			disabled={disabled}
		>
			{isSubscribed ? 'Unsubscribe' : 'Subscribe'}
		</Button>
	);
};
