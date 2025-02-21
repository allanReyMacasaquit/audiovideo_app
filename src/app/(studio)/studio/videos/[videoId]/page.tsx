import VideoView from '@/modules/studio/ui/components/views/video-view';
import { HydrateClient, trpc } from '@/trpc/server';

interface Props {
	params: Promise<{ videoId: string }>;
}

export const dynamic = 'force-dynamic';

const VideoIdPage = async ({ params }: Props) => {
	const { videoId } = await params;

	void trpc.studio.getOne.prefetch({ id: videoId });
	void trpc.categories.getMany.prefetch();
	return (
		<HydrateClient>
			<VideoView videoId={videoId} />
		</HydrateClient>
	);
};
export default VideoIdPage;
