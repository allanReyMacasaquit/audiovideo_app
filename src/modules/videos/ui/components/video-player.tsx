'use client';

import MuxPlayer from '@mux/mux-player-react';

interface VideoPlayerProps {
	playbackId?: string | null | undefined; // URL or source for your video
	thumbnailUrl?: string | null | undefined; // Optional poster/thumbnail image
	autoPlay?: boolean; // Automatically start playback when true
	onPlay?: (event: Event) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
	playbackId,
	thumbnailUrl,
	autoPlay,
	onPlay,
}) => {
	return (
		<MuxPlayer
			playbackId={playbackId || ''}
			autoPlay={autoPlay}
			onPlay={onPlay}
			playerInitTime={0}
			thumbnailTime={0}
			poster={thumbnailUrl || '/thumbnail.svg'}
			className='w-full h-full object-contain'
			accentColor='#ff2056'
		/>
	);
};
