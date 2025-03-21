import { cva, VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/user-avatar';
import UserInfo from '@/modules/users/ui/components/user-info';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { VideoGetManyOutputType } from '../type';
import VideoThumbnail from './video-thumbnail';
import { VideoMenu } from './video-menu';
import { formatDistanceToNow } from 'date-fns';

const videoGridCardVariants = cva('group flex flex-col', {
	variants: {
		size: {
			default: 'gap-3',
			compact: 'gap-2',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

const thumbnailVariants = cva('relative aspect-video', {
	variants: {
		size: {
			default: 'h-48',
			compact: 'h-32',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

interface VideoGridCardProps
	extends VariantProps<typeof videoGridCardVariants> {
	data: VideoGetManyOutputType['items'][number];
	onRemove?: () => void;
}
export const VideoGridCard = ({ data, size, onRemove }: VideoGridCardProps) => {
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
		<div className='px-4 mt-2'>
			<div className={videoGridCardVariants({ size })}>
				<div className='relative '>
					<Link
						href={`/videos/${data.id}`}
						className={cn(thumbnailVariants({ size }), 'w-full')}
					>
						<VideoThumbnail
							imageUrl={data.thumbnailUrl}
							previewUrl={data.previewUrl}
							title={data.title}
							duration={data.duration ?? 0}
						/>
					</Link>
					<div className='absolute top-2 right-2 z-10'>
						<VideoMenu videoId={data.id} onRemove={onRemove} />
					</div>
				</div>

				<div className='flex flex-col px-2 pb-8'>
					<Link href={`/videos/${data.id}`}>
						<h3
							className={cn(
								'font-medium line-clamp-2',
								size === 'compact' ? 'text-sm' : 'text-base'
							)}
						>
							{data.title ?? ''}
						</h3>
					</Link>

					<div className='flex items-center gap-2'>
						<UserAvatar
							imageUrl={data.user.imageUrl}
							name={data.user.name}
							size='md'
						/>
						<UserInfo
							name={data.user.name}
							className={size === 'compact' ? 'text-xs' : 'text-sm'}
						/>
					</div>

					<div className='flex items-center gap-3 text-muted-foreground'>
						<p className={cn(size === 'compact' ? 'text-xs' : 'text-sm')}>
							{compactViews} views
						</p>
						<p className={cn(size === 'compact' ? 'text-xs' : 'text-sm')}>
							{compactLikes} likes
						</p>
						<p className={cn(size === 'compact' ? 'text-xs' : 'text-sm')}>
							{compactDate}
						</p>
					</div>

					{size === 'default' && data.description && (
						<Tooltip>
							<TooltipTrigger asChild>
								<p className='text-xs text-muted-foreground line-clamp-2 hover:underline cursor-help'>
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
				</div>
			</div>
		</div>
	);
};
