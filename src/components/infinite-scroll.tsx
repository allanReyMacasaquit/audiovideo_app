import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import React, { useEffect } from 'react';
import { Button } from './ui/button';

interface InfiniteScrollProps {
	isManual?: boolean; // Whether the user triggers the next page manually
	hasNextPage: boolean; // If there's another page of data
	isFetchingNextPage: boolean; // If the next page is currently being fetched
	fetchNextPage: () => void; // Function to call to fetch the next page
}

export const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
	isManual = false,
	hasNextPage,
	isFetchingNextPage,
	fetchNextPage,
}) => {
	const { targetRef, isIntersecting } = useIntersectionObserver({
		threshold: 0.5,
		rootMargin: '100px',
	});

	// When not in manual mode, trigger fetchNextPage if the sentinel is visible,
	// there's a next page, and we're not already fetching.
	useEffect(() => {
		if (!isManual && hasNextPage && isIntersecting && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [
		isManual,
		hasNextPage,
		isIntersecting,
		isFetchingNextPage,
		fetchNextPage,
	]);

	return (
		<div>
			{hasNextPage && !isManual && (
				// The sentinel element for automatic infinite scroll
				<div ref={targetRef}>
					{isFetchingNextPage && (
						<div className='p-4 text-center'>Loading...</div>
					)}
				</div>
			)}
			{hasNextPage && isManual && (
				// A manual trigger button when isManual is true
				<div className='text-center my-4'>
					<Button onClick={fetchNextPage} disabled={isFetchingNextPage}>
						{isFetchingNextPage ? 'Loading...' : 'Load More'}
					</Button>
				</div>
			)}
			{!hasNextPage && (
				<p className='py-4 text-sm text-muted-foreground flex justify-center'>
					No items available / End
				</p>
			)}
		</div>
	);
};
