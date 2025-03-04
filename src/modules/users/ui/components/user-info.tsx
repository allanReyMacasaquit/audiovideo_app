import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

const userInfoVariants = cva('flex items-center gap-1', {
	variants: {
		size: {
			default: '[&_p]:text-sm [&_svg]:size-4',
			lg: '[&_p]:text-base [&_svg]:size-5 [&_p]:font-medium [&_p]:text-black',
			sm: '[&_p]:text-xs [&_svg]:size-3.5',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

interface UserInfoProps extends VariantProps<typeof userInfoVariants> {
	name: string;
	icon?: React.ReactNode;
	tooltip?: string;
	className?: string;
}

const UserInfo: React.FC<UserInfoProps> = ({
	name,
	icon,
	size,
	tooltip,
	className,
}) => {
	return (
		<Tooltip.Provider>
			<Tooltip.Root delayDuration={200}>
				<Tooltip.Trigger asChild>
					<div className={cn(userInfoVariants({ size }), className)}>
						{icon && <span>{icon}</span>}
						<p>{name}</p>
					</div>
				</Tooltip.Trigger>
				{tooltip && (
					<Tooltip.Portal>
						<Tooltip.Content
							className='bg-gray-900 text-white text-xs rounded-md px-2 py-1 shadow-md'
							side='top'
							sideOffset={5}
						>
							{tooltip}
							<Tooltip.Arrow className='fill-gray-900' />
						</Tooltip.Content>
					</Tooltip.Portal>
				)}
			</Tooltip.Root>
		</Tooltip.Provider>
	);
};

export default UserInfo;
