import { VideosSectionForm } from '../sections/videos-section-form';

interface Props {
	videoId: string;
}

const VideoView = ({ videoId }: Props) => {
	return (
		<div className='p-2 max-w-7xl pt-6'>
			<VideosSectionForm videoId={videoId} />
		</div>
	);
};
export default VideoView;
