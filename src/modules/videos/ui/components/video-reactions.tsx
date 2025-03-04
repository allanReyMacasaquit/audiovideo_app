import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

export const VideoReactions = () => {
	const viewerReaction = 'like'; // Example: This would be dynamic

	return (
		<div className='flex items-center flex-none '>
			{/* Like Button */}
			<Button
				variant='outline'
				className='rounded-l-full rounded-r-none gap-2 pr-4'
			>
				<ThumbsUp
					className={cn('size-5', viewerReaction === 'like' && 'fill-black')}
				/>
				<span className='ml-1'>1</span> {/* Example count */}
			</Button>

			{/* Dislike Button */}
			<Button
				variant='outline'
				className='rounded-r-full rounded-l-none gap-2 pr-4'
			>
				<ThumbsDown
					className={cn('size-5', viewerReaction !== 'like' && 'fill-black')}
				/>
				<span className='ml-1'>0</span> {/* Example count */}
			</Button>
		</div>
	);
};
