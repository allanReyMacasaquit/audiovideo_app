import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubscriptionButtonProps extends ButtonProps {
	isSubscribed: boolean;
}

export const SubscriptionButton = ({
	isSubscribed,
	className,
	...props // Spread all button props
}: SubscriptionButtonProps) => {
	return (
		<div className='px-4'>
			<Button {...props} className={cn('rounded-full', className)}>
				{isSubscribed ? 'Unsubscribe' : 'Subscribe'}
			</Button>
		</div>
	);
};
