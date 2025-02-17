'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/trpc/client';
import { Loader2Icon, UploadIcon } from 'lucide-react';
import { toast } from 'sonner';

const StudioUploadModal = () => {
	const utils = trpc.useUtils();

	const create = trpc.videos.create.useMutation({
		onSuccess: () => {
			toast.success('Video Upload');
			utils.studio.getMany.invalidate();
		},
		onError: () => {
			toast.error('Video cannot Upload');
		},
	});

	return (
		<Button
			variant='secondary'
			onClick={() => create.mutate()}
			disabled={create.isPending}
		>
			{create.isPending ? (
				<Loader2Icon className='animate-spin' />
			) : (
				<UploadIcon />
			)}
			Upload
		</Button>
	);
};
export default StudioUploadModal;
