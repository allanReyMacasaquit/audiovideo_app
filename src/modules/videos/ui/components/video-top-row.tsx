'use client';

import { useMemo } from 'react';
import { VideoGetOneOutputType } from '../type';
import VideoDescription from './video-description';
import VideoOwner from './video-owner';
import { VideoReactions } from './video-reactions';
import { format, formatDistanceToNow } from 'date-fns';

interface VideoTopRowProps {
	video: VideoGetOneOutputType;
}

export const VideoTopRow = ({ video }: VideoTopRowProps) => {
	const expandedViews = useMemo(() => {
		return Intl.NumberFormat('en', {
			notation: 'standard',
		}).format(video.viewCount);
	}, [video.viewCount]);

	const compactViews = useMemo(() => {
		return Intl.NumberFormat('en', {
			notation: 'compact',
		}).format(video.viewCount);
	}, [video.viewCount]);

	const compactDate = useMemo(() => {
		return formatDistanceToNow(video.createdAt, { addSuffix: true });
	}, [video.createdAt]);

	const expandedDate = useMemo(() => {
		return format(video.createdAt, 'd MMM yyyy');
	}, [video.createdAt]);

	return (
		<div className='flex flex-col gap-4 mt-4 p-2'>
			<h1 className='text-xl font-semibold'>{video.title}</h1>
			<div className='flex flex-col justify-between gap-4'>
				<VideoOwner user={video.user} videoId={video.id} video={video} />
				<VideoReactions
					viewerReaction={video.viewerReactions}
					dislike={video.dislikeCount}
					like={video.likeCount}
					videoId={video.id}
				/>
			</div>
			<VideoDescription
				compactViews={compactViews}
				expandedViews={expandedViews}
				compactDate={compactDate}
				expandedDate={expandedDate}
				description={video.description}
			/>
		</div>
	);
};
