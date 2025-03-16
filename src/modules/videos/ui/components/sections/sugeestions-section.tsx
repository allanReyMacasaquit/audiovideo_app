'use client';

import { trpc } from '@/trpc/client';
import { VideoRowCard } from '../video-row-card';
import { VideoGridCard } from '../video-grid-card';

interface Props {
	videoId: string;
}

const SuggestionsSection = ({ videoId }: Props) => {
	const [suggestions] = trpc.suggestions.getMany.useSuspenseInfiniteQuery(
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
			<div className='hidden md:block space-y-4'>
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
		</>
	);
};

export default SuggestionsSection;
