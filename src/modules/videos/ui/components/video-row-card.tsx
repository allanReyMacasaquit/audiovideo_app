import { cva, VariantProps } from 'class-variance-authority';
import { VideoGetManyOutputType } from '../type';
import VideoThumbnail from './video-thumbnail';
import Link from 'next/link';
import { Suspense, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import FallbackSection from './sections/fallback-section';
import { cn } from '@/lib/utils';
import { UserAvatar } from '@/components/user-avatar';
import UserInfo from '@/modules/users/ui/components/user-info';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { VideoMenu } from './video-menu';

const videoRowCardVariants = cva('group flex min-w-0', {
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

const thumbnailVariants = cva('relative flex-none', {
	variants: {
		size: {
			default: 'h-24 w-40',
			compact: 'h-16 w-28',
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
	return (
		<Suspense fallback={<span>Loading...</span>}>
			<ErrorBoundary fallback={<FallbackSection />}>
				<VideoRowCardSkeleton data={data} size={size} onRemove={onRemove} />
			</ErrorBoundary>
		</Suspense>
	);
};

export const VideoRowCardSkeleton = ({
	data,
	size,
	onRemove,
}: VideoRowCardProps) => {
	const compactViews = useMemo(() => {
		const formatter = Intl.NumberFormat('en', { notation: 'compact' });
		return formatter.format(data.viewCount);
	}, [data.viewCount]);

	const compactLikes = useMemo(() => {
		const formatter = Intl.NumberFormat('en', { notation: 'compact' });
		return formatter.format(data.likeCount);
	}, [data.likeCount]);
	return (
		<div className={videoRowCardVariants({ size })}>
			<Link href={`/videos/${data.id}`} className={thumbnailVariants({ size })}>
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
						<div className='flex items-center gap-2'>
							<UserAvatar
								imageUrl={data.user.imageUrl}
								name={data.user.name}
								size='sm'
							/>
							<UserInfo name={data.user.name} />
						</div>
						{size === 'default' && (
							<p className='text-muted-foreground text-sm mt-1'>
								{compactViews} views • {compactLikes} likes
							</p>
						)}
						<h3
							className={cn(
								'font-medium line-clamp-1 mt-1',
								size === 'compact' ? 'text-sm' : 'text-base'
							)}
						>
							{data.title ?? ''}
						</h3>

						{size === 'default' && (
							<>
								<Tooltip>
									<TooltipTrigger asChild>
										<p className='text-xs text-muted-foreground w-fit line-clamp-2 mt-2'>
											{data.description ?? ''}
										</p>
									</TooltipTrigger>
									<TooltipContent align='center' side='bottom'>
										<p className='max-w-lg mx-auto text-lg bg-gradient-to-r from-green-900 to-purple-700 text-white p-2 rounded-md'>
											{data.description ?? ''}
										</p>
									</TooltipContent>
								</Tooltip>
							</>
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
