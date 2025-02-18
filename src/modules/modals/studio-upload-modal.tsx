'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/trpc/client';
import { Loader2Icon, VideoIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ResponsiveModal } from './responsive-modal';
import { StudioUploader } from '../studio/ui/components/mux/studio-uploader';

const StudioUploadModal = () => {
	const utils = trpc.useUtils();

	const create = trpc.videos.create.useMutation({
		onSuccess: () => {
			utils.studio.getMany.invalidate();
		},
		onError: () => {
			toast.error('Video cannot Upload');
		},
	});

	return (
		<>
			<ResponsiveModal
				title='Upload a video'
				open={!!create.data?.url}
				onOpenChange={() => create.reset()}
			>
				{create.data?.url ? (
					<StudioUploader endpoint={create.data?.url} onSuccess={() => {}} />
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
