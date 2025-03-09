import VideoIdView from '@/modules/videos/ui/components/views/video-id-view';
import { HydrateClient, trpc } from '@/trpc/server';

interface VideoIdPageProps {
	params: Promise<{ videoId: string }>;
}
export const dynamic = 'force-dynamic';

const VideoIdPage = async ({ params }: VideoIdPageProps) => {
	const { videoId } = await params;

	void trpc.videos.getOne.prefetch({ id: videoId });
	void trpc.comments.getMany.prefetchInfinite({ videoId });

	return (
		<HydrateClient>
			<VideoIdView videoId={videoId} />
		</HydrateClient>
	);
};
export default VideoIdPage;
