'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function VideoIdSectionSkeleton() {
	return (
		<div className='space-y-4'>
			{/* Video Player Skeleton */}
			<Skeleton className='aspect-video bg-black rounded-lg' />

			{/* Title */}
			<Skeleton className='h-6 w-3/4' />

			{/* User Info */}
			<div className='flex items-center gap-3'>
				<Skeleton className='h-10 w-10 rounded-full' />
				<div className='min-w-0'>
					<Skeleton className='h-4 w-24 mb-1' />
					<Skeleton className='h-3 w-16' />
				</div>
				<Button disabled className='rounded-full'>
					<Skeleton className='h-4 w-20' />
				</Button>
			</div>

			{/* Video Stats */}
			<div className='flex gap-2'>
				<Skeleton className='h-4 w-12' />
				<Skeleton className='h-4 w-12' />
			</div>

			{/* Video Description */}
			<Skeleton className='h-4 w-full' />
			<Skeleton className='h-4 w-5/6' />
			<Skeleton className='h-4 w-4/6' />
		</div>
	);
}
