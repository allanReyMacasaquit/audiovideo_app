import { Skeleton } from '@/components/ui/skeleton';
import { VariantProps } from 'class-variance-authority';
import { thumbnailVariants, videoRowCardVariants } from '../video-row-card';
import { cn } from '@/lib/utils';

// Define the props interface for the skeleton component
interface VideoRowCardProps extends VariantProps<typeof videoRowCardVariants> {
	onRemove?: () => void;
}

// The original SuggestionsSectionSkeleton component
export const SuggestionsSectionSkeleton = ({ size }: VideoRowCardProps) => {
	return (
		<div className={videoRowCardVariants({ size })}>
			{/* Thumbnail skeleton */}
			<div className={thumbnailVariants({ size })}>
				<div className='relative w-full overflow-hidden rounded-xl aspect-video'>
					<Skeleton className='size-full' />
				</div>
			</div>

			{/* Info skeleton */}
			<div className='flex-1 min-w-0'>
				<div className='flex justify-between gap-x-2'>
					<div className='flex-1 min-w-0'>
						<Skeleton
							className={cn('h-5 w-[40%]', size === 'compact' && 'h-4 w-[40%]')}
						/>
						{size === 'default' && (
							<>
								<Skeleton className='h-4 w-[20%] mt-1' />
								<div className='flex items-center gap-2 my-3'>
									<Skeleton className='size-8 rounded-full' />
									<Skeleton className='h-4 w-24' />
								</div>
							</>
						)}
						{size === 'compact' && (
							<>
								<Skeleton className='h-4 w-[50%] mt-1' />
								<div className='flex items-center gap-2 my-3'>
									<Skeleton className='size-8 rounded-full' />
									<Skeleton className='h-4 w-24' />
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

// New component to render an array of 6 SuggestionsSectionSkeleton components
export const SuggestionsSectionSkeletonList = () => {
	// Create an array of 6 elements
	const skeletonArray = Array.from({ length: 6 }, (_, index) => (
		<SuggestionsSectionSkeleton
			key={index}
			size={index % 2 === 0 ? 'default' : 'compact'} // Alternates between "default" and "compact"
		/>
	));

	return <div className='space-y-4'>{skeletonArray}</div>;
};
