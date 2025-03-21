'use client';

import { trpc } from '@/trpc/client';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { VideoPlayer } from '../video-player';
import { cn } from '@/lib/utils';
import VideoBanner from '../video-banner';
import { VideoTopRow } from '../video-top-row';
import { useAuth } from '@clerk/nextjs';
import VideoIdSectionSkeleton from './video-id-section-skeleton';

import FallbackSection from './fallback-section';

interface Props {
	videoId: string;
}
export const VideoIdSection = ({ videoId }: Props) => {
	return (
		<Suspense fallback={<VideoIdSectionSkeleton />}>
			<ErrorBoundary fallback={<FallbackSection />}>
				<VideoIdSectionSuspense videoId={videoId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const VideoIdSectionSuspense = ({ videoId }: Props) => {
	const [videoIdData] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });

	const { isSignedIn } = useAuth();
	const utils = trpc.useUtils();

	const createView = trpc.videoViews.create.useMutation({
		onSuccess: () => {
			utils.videos.getOne.invalidate({ id: videoId });
		},
	});

	const handlePlay = () => {
		if (!isSignedIn) return;

		createView.mutate({ videoId });
	};
	return (
		<>
			<div
				className={cn(
					'aspect-video bg-black rounded-xl overflow-hidden relative mx-4',
					videoIdData.muxStatus !== 'ready' && 'rounded-b-none'
				)}
			>
				<VideoPlayer
					autoPlay
					onPlay={handlePlay}
					playbackId={videoIdData.muxPlaybackId}
					thumbnailUrl={videoIdData.thumbnailUrl}
				/>
			</div>
			<div className='px-4'>
				<VideoBanner status={videoIdData.muxStatus} />
			</div>

			<VideoTopRow video={videoIdData} />
		</>
	);
};
