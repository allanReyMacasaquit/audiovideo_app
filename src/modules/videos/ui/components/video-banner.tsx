import { VideoGetOneOutputType } from '../type';
import { AlertTriangleIcon } from 'lucide-react';

interface VideoBannerProps {
	status: VideoGetOneOutputType['muxStatus'];
}

const VideoBanner = ({ status }: VideoBannerProps) => {
	if (status === 'ready') return null;
	return (
		<div className='bg-yellow-500 py-3 px-4 rounded-b-xl flex items-center gap-2 '>
			<AlertTriangleIcon className='text-black shrink-0 h-4 w-4' />
			<p className='text-xs md:text-sm font-medium text-black line-clamp-1'>
				This video is still being processed
			</p>
		</div>
	);
};
export default VideoBanner;
