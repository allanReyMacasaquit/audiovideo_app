import { CommentsSection } from '../sections/comments-section';
import SuggestionsSection from '../sections/sugeestions-section';
import { VideoIdSection } from '../sections/video-id-section';

interface Props {
	videoId: string;
}

const VideoIdView = ({ videoId }: Props) => {
	return (
		<div className='max-w-[110rem] mx-auto flex flex-col gap-6 pt-6'>
			{/* Header Section */}
			<div className='flex flex-col xl:flex-row gap-6'>
				<div className='flex-1 min-w-0'>
					<VideoIdSection videoId={videoId} />
					<div className='xl:hidden block'>
						<SuggestionsSection />
					</div>
					<CommentsSection videoId={videoId} />
				</div>
				<div className='hidden xl:block w-full xl:w-96 2xl:w-[29rem]'>
					<SuggestionsSection />
				</div>
			</div>
		</div>
	);
};
export default VideoIdView;
