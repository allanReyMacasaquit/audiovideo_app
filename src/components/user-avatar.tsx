import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { cva, VariantProps } from 'class-variance-authority';

const avatarVariants = cva('rounded-full overflow-hidden', {
	variants: {
		size: {
			default: 'h-9 w-9',
			sm: 'h-4 w-4',
			md: 'h-6 w-6',
			lg: 'h-16 w-16',
			xl: 'h-[160px] w-[160px]',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});
interface UserAvatarProps extends VariantProps<typeof avatarVariants> {
	imageUrl: string;
	name?: string;
	className?: string;
	onClick?: () => void;
}

export const UserAvatar = ({
	imageUrl,
	name,
	size,
	className,
	onClick,
}: UserAvatarProps) => {
	return (
		<Avatar
			// Merge avatar variant classes with any additional className
			className={cn(avatarVariants({ size }), className)}
			onClick={onClick}
		>
			{/* User image */}
			<AvatarImage src={imageUrl} alt={name} />

			{/* Fallback if no image or it fails to load */}
			<AvatarFallback>{name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
		</Avatar>
	);
};
