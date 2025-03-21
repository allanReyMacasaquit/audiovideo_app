'use client';

import { trpc } from '@/trpc/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { VideoGridCard } from '@/modules/videos/ui/components/video-grid-card';
import { VideoRowCard } from '@/modules/videos/ui/components/video-row-card';
import { InfiniteScroll } from '@/components/infinite-scroll';
import { Suspense } from 'react';
import { SuggestionsSectionSkeletonList } from '@/modules/videos/ui/components/sections/suggestions-section-skeleton';
import FallbackSection from '@/modules/videos/ui/components/sections/fallback-section';
import { ErrorBoundary } from 'react-error-boundary';

interface ResultCategoriesSectionProps {
	query: string | undefined;
	categoryId: string | undefined;
}

export const ResultCategoriesSection = ({
	query,
	categoryId,
}: ResultCategoriesSectionProps) => {
	return (
		<Suspense fallback={<SuggestionsSectionSkeletonList />}>
			<ErrorBoundary fallback={<FallbackSection />}>
				<ResultCategoriesSectionSuspense
					query={query}
					categoryId={categoryId}
				/>
			</ErrorBoundary>
		</Suspense>
	);
};

const ResultCategoriesSectionSuspense = ({
	query,
	categoryId,
}: ResultCategoriesSectionProps) => {
	const isMobile = useIsMobile();
	const [results, nextResults] = trpc.search.getMany.useSuspenseInfiniteQuery(
		{
			query,
			categoryId,
			limit: 5,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	);

	return (
		<div className='pt-10'>
			{isMobile ? (
				<div className='md:hidden grid grid-cols-1 gap-4 '>
					{results.pages.flatMap((page, index) => (
						<div key={index}>
							{page.items.map((video) => (
								<VideoGridCard key={video.id} data={video} size='default' />
							))}
						</div>
					))}
				</div>
			) : (
				<div className='hidden md:block space-y-4 pr-4'>
					{results.pages.flatMap((page, index) => (
						<div key={index}>
							{page.items.map((video) => (
								<VideoRowCard key={video.id} data={video} size='default' />
							))}
						</div>
					))}
				</div>
			)}
			<InfiniteScroll
				fetchNextPage={nextResults.fetchNextPage}
				hasNextPage={nextResults.hasNextPage}
				isFetchingNextPage={nextResults.isFetchingNextPage}
			/>
		</div>
	);
};
