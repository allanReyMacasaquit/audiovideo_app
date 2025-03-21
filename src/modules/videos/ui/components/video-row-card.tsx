import { cva, VariantProps } from 'class-variance-authority';
import { VideoGetManyOutputType } from '../type';
import VideoThumbnail from './video-thumbnail';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/user-avatar';
import UserInfo from '@/modules/users/ui/components/user-info';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { VideoMenu } from './video-menu';
import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';

export const videoRowCardVariants = cva('group flex min-w-0', {
	variants: {
		size: {
			default: 'gap-4',
			compact: 'gap-2',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

export const thumbnailVariants = cva('relative flex-none', {
	variants: {
		size: {
			default: 'h-26 w-48',
			compact: 'h-26 w-48',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});
interface VideoRowCardProps extends VariantProps<typeof videoRowCardVariants> {
	data: VideoGetManyOutputType['items'][number];
	onRemove?: () => void;
}

export const VideoRowCard = ({ data, size, onRemove }: VideoRowCardProps) => {
	const compactViews = useMemo(() => {
		const formatter = Intl.NumberFormat('en', { notation: 'compact' });
		return formatter.format(data.viewCount);
	}, [data.viewCount]);

	const compactLikes = useMemo(() => {
		const formatter = Intl.NumberFormat('en', { notation: 'compact' });
		return formatter.format(data.likeCount);
	}, [data.likeCount]);

	const compactDate = useMemo(() => {
		return formatDistanceToNow(data.createdAt, { addSuffix: true });
	}, [data.createdAt]);

	return (
		<div className={cn(videoRowCardVariants({ size }), 'py-2')}>
			<Link
				href={`/videos/${data.id}`}
				className={cn(thumbnailVariants({ size }))}
			>
				<VideoThumbnail
					imageUrl={data.thumbnailUrl}
					previewUrl={data.previewUrl}
					title={data.title}
					duration={data.duration ?? 0}
				/>
			</Link>
			<div className='flex-1 min-w-0'>
				<div className='flex justify-between gap-x-2'>
					<Link href={`/videos/${data.id}`} className='flex-1 min-w-0'>
						<h3
							className={cn(
								'font-medium line-clamp-1 mt-1',
								size === 'default' ? 'text-sm' : 'text-base'
							)}
						>
							{data.title ?? ''}
						</h3>

						{size === 'default' && (
							<p className='text-muted-foreground text-xs'>
								{compactViews} views • {compactLikes} likes
							</p>
						)}
						<div className='flex items-center gap-2 pt-2'>
							<UserAvatar
								imageUrl={data.user.imageUrl}
								name={data.user.name}
								size='sm'
							/>
							<UserInfo name={data.user.name} />
						</div>
						<p className={cn(size === 'default' ? 'text-xs' : 'text-sm')}>
							{compactDate}
						</p>
						{size === 'default' && data.description && (
							<Tooltip>
								<TooltipTrigger asChild>
									<p className='text-xs mt-1 text-muted-foreground line-clamp-1 hover:underline cursor-help'>
										{data.description}
									</p>
								</TooltipTrigger>
								<TooltipContent
									side='bottom'
									className='max-w-[300px] text-sm font-semibold bg-black/90 p-2'
								>
									<p className='text-white rounded-md h-[150px] w-[300px] overflow-auto p-2'>
										{data.description ? data.description : ''}
									</p>
								</TooltipContent>
							</Tooltip>
						)}
						{/* Compact view elements */}
						{size === 'compact' && (
							<p className='text-muted-foreground text-xs mt-1'>
								{compactViews} views • {compactLikes} likes
							</p>
						)}
					</Link>
					{/* Video menu */}
					<div className='flex-none'>
						<VideoMenu videoId={data.id} onRemove={onRemove} />
					</div>
				</div>
			</div>
		</div>
	);
};
