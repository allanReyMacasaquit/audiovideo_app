'use client';

import { InfiniteScroll } from '@/components/infinite-scroll';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { trpc } from '@/trpc/client';
import Link from 'next/link';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export const VideosSection = () => {
	return (
		<Suspense fallback='Loading...'>
			<ErrorBoundary fallback={<div>Something went wrong</div>}>
				<StudioSectionSuspense />
			</ErrorBoundary>
		</Suspense>
	);
};

const StudioSectionSuspense = () => {
	const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
		{ limit: 5 },
		{ getNextPageParam: (lastPage) => lastPage.nextCursor }
	);

	return (
		<div>
			<div className='border-y'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='pl-6 w-[510px]'>Video</TableHead>
							<TableHead>Visibility</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Views</TableHead>
							<TableHead>Comments</TableHead>
							<TableHead>Likes</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{videos.pages
							.flatMap((page) => page.items)
							.map((video) => (
								<Link
									href={`/studio/videos/${video.id}`}
									key={video.id}
									legacyBehavior
								>
									<TableRow className='cursor-pointer'>
										<TableCell>{video.title}</TableCell>
										<TableCell>visibility</TableCell>
										<TableCell>Status</TableCell>
										<TableCell>Date</TableCell>
										<TableCell>Views</TableCell>
										<TableCell>Commnents</TableCell>

										<TableCell>Likes</TableCell>
									</TableRow>
								</Link>
							))}
					</TableBody>
				</Table>
			</div>

			<InfiniteScroll
				isManual
				hasNextPage={query.hasNextPage}
				isFetchingNextPage={query.isFetchingNextPage}
				fetchNextPage={query.fetchNextPage}
			/>
		</div>
	);
};
