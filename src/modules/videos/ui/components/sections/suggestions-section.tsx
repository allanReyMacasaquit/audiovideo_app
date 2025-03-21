'use client';

import { trpc } from '@/trpc/client';
import { VideoRowCard } from '../video-row-card';
import { VideoGridCard } from '../video-grid-card';
import { InfiniteScroll } from '@/components/infinite-scroll';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import FallbackSection from './fallback-section';
import { SuggestionsSectionSkeletonList } from './suggestions-section-skeleton';

interface Props {
	videoId: string;
}

export const SuggestionsSection = ({ videoId }: Props) => {
	return (
		<Suspense fallback={<SuggestionsSectionSkeletonList />}>
			<ErrorBoundary fallback={<FallbackSection />}>
				<SuggestionsSectionSuspense videoId={videoId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const SuggestionsSectionSuspense = ({ videoId }: Props) => {
	const [suggestions, query] =
		trpc.suggestions.getMany.useSuspenseInfiniteQuery(
			{
				videoId,
				limit: 5,
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			}
		);

	const videos = suggestions.pages.flatMap((page) => page.items ?? []);

	return (
		<>
			{/* Desktop - Row layout */}
			<div className='hidden md:block space-y-4 pr-4'>
				{videos.map((video) => (
					<VideoRowCard key={video.id} data={video} size='compact' />
				))}
			</div>

			{/* Mobile - Grid layout */}
			<div className='md:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 '>
				{videos.map((video) => (
					<VideoGridCard key={video.id} data={video} size='default' />
				))}
			</div>
			<InfiniteScroll
				isManual
				hasNextPage={query.hasNextPage}
				isFetchingNextPage={query.isFetchingNextPage}
				fetchNextPage={query.fetchNextPage}
			/>
		</>
	);
};
