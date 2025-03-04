'use client';

import { trpc } from '@/trpc/client';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { VideoPlayer } from '../video-player';
import { cn } from '@/lib/utils';
import VideoBanner from '../video-banner';
import { VideoTopRow } from '../video-top-row';

interface Props {
	videoId: string;
}
export const VideoIdSection = ({ videoId }: Props) => {
	return (
		<Suspense fallback={<p>Loading...</p>}>
			<ErrorBoundary fallback={<p>Error..</p>}>
				<VideoIdSectionSuspense videoId={videoId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const VideoIdSectionSuspense = ({ videoId }: Props) => {
	const [videoIdData] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });
	return (
		<>
			<div
				className={cn(
					'aspect-video bg-black rounded-xl overflow-hidden relative px-3',
					videoIdData.muxStatus !== 'ready' && 'rounded-b-none'
				)}
			>
				<VideoPlayer
					autoPlay
					onPlay={() => {}}
					playbackId={videoIdData.muxPlaybackId}
					thumbnailUrl={videoIdData.thumbnailUrl}
				/>
			</div>
			<VideoBanner status={videoIdData.muxStatus} />
			<VideoTopRow video={videoIdData} />
		</>
	);
};
