import { formatDuration } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';

interface Props {
	imageUrl?: string | null;
	previewUrl?: string | null;
	title: string;
	duration: number;
}

const VideoThumbnail = ({ imageUrl, previewUrl, title, duration }: Props) => {
	return (
		<div className='relative group cursor-pointer rounded-lg overflow-hidden'>
			{/* Using Tailwind's aspect-video utility for a 16:9 ratio */}
			<div className='aspect-video'>
				<Image
					src={imageUrl ?? './video_error_placeholder.svg'}
					fill
					alt={title}
					className='object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:opacity-0'
				/>
				<Image
					unoptimized={!!previewUrl}
					src={previewUrl ?? './video_error_placeholder.svg'}
					fill
					alt={title}
					className='object-cover w-full h-full transition-transform duration-300 ease-in-out opacity-0 group-hover:opacity-100'
				/>
			</div>
			<div className='absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-xs font-medium'>
				{formatDuration(duration)}
			</div>
		</div>
	);
};

export default VideoThumbnail;
