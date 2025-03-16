'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/trpc/client';
import { Loader2Icon, VideoIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ResponsiveModal } from './responsive-modal';
import { StudioUploader } from '../studio/ui/components/mux/studio-uploader';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';

const StudioUploadModal = () => {
	const utils = trpc.useUtils();
	const router = useRouter();
	const clerkUser = useClerk();

	const create = trpc.videos.create.useMutation({
		onSuccess: () => {
			utils.studio.getMany.invalidate();
		},
		onError: () => {
			toast.error('Login to upload videos.');
			clerkUser.openSignIn();
		},
	});

	const onSuccess = () => {
		if (!create.data?.video.id) return;
		create.reset();
		router.push(`/studio/videos/${create.data.video.id}`);
	};

	return (
		<>
			<ResponsiveModal
				title='Upload a video'
				open={!!create.data?.url}
				onOpenChange={() => create.reset()}
			>
				{create.data?.url ? (
					<StudioUploader endpoint={create.data?.url} onSuccess={onSuccess} />
				) : (
					<Loader2Icon className='animate-spin' />
				)}
			</ResponsiveModal>

			<Button
				variant='secondary'
				onClick={() => create.mutate()}
				disabled={create.isPending}
				className='rounded-full hover:bg-gray-200 px-4'
			>
				{create.isPending ? (
					<Loader2Icon className='animate-spin' />
				) : (
					<VideoIcon />
				)}
				Create
			</Button>
		</>
	);
};
export default StudioUploadModal;
