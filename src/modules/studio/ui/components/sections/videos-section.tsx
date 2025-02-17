'use client';

import FilterCarousel from '@/components/filter-carousel';
import { trpc } from '@/trpc/client';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const VideosSection = () => {
	return (
		<Suspense
			fallback={<FilterCarousel isLoading data={[]} onSelect={() => {}} />}
		>
			<ErrorBoundary fallback={<div>Something went wrong</div>}>
				<StudioSectionSuspense />
			</ErrorBoundary>
		</Suspense>
	);
};

const StudioSectionSuspense = () => {
	const [studio] = trpc.studio.getMany.useSuspenseInfiniteQuery(
		{ limit: 10 },
		{ getNextPageParam: (lastPage) => lastPage.nextCursor }
	);

	return <div>{JSON.stringify(studio)}</div>;
};
