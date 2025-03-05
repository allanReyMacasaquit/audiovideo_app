import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { VideoGetOneOutputType } from '../type';
import { useClerk } from '@clerk/nextjs';
import { trpc } from '@/trpc/client';

interface Props {
	like: number;
	dislike: number;
	videoId: string;
	viewerReaction: VideoGetOneOutputType['viewerReactions'];
}

export const VideoReactions = ({
	like,
	dislike,
	videoId,
	viewerReaction,
}: Props) => {
	const clerk = useClerk();
	const utils = trpc.useUtils();

	const handleLike = trpc.videoReactions.like.useMutation({
		onSuccess: () => {
			utils.videos.getOne.invalidate({ id: videoId });
		},
		onError: (error) => {
			if (error.data?.code === 'UNAUTHORIZED') {
				clerk.openSignIn();
			}
		},
	});

	const handleDislike = trpc.videoReactions.dislike.useMutation({
		onSuccess: () => {
			utils.videos.getOne.invalidate({ id: videoId });
		},
		onError: (error) => {
			if (error.data?.code === 'UNAUTHORIZED') {
				clerk.openSignIn();
			}
		},
	});

	return (
		<div className='flex items-center flex-none space-x-4'>
			{/* Like Button */}
			<div className='flex flex-col items-center'>
				<Button
					onClick={() => handleLike.mutate({ videoId })}
					disabled={handleLike.isPending}
					variant='outline'
					className='rounded-l-full rounded-r-none pr-4 items-end'
				>
					<ThumbsUp
						className={cn('h-4 w-4', viewerReaction === 'like' && 'fill-black')}
					/>
					<span className='text-sm mt-1'>{like}</span> {/* Like Count */}
				</Button>
			</div>

			{/* Dislike Button */}
			<div className='flex flex-col items-center'>
				<Button
					onClick={() => handleDislike.mutate({ videoId })}
					disabled={handleDislike.isPending}
					variant='outline'
					className='rounded-r-full rounded-l-none pl-4 items-end'
				>
					<span className='text-sm mt-1'>{dislike}</span> {/* Dislike Count */}
					<ThumbsDown
						className={cn(
							'h-4 w-4',
							viewerReaction === 'dislike' && 'fill-black'
						)}
					/>
				</Button>
			</div>
		</div>
	);
};
