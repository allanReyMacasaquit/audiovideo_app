'use client';

import { trpc } from '@/trpc/client';
import { ResponsiveModal } from './responsive-modal';
import { UploadDropzone } from '@/lib/uploadthing';

interface ThumbnailModalProps {
	open: boolean;
	videoId: string;
	onOpenChange: (open: boolean) => void;
}

const ThumbnailUploadModal = ({
	videoId,
	open,
	onOpenChange,
}: ThumbnailModalProps) => {
	const utils = trpc.useUtils();

	const onClientUploadComplete = () => {
		utils.studio.getMany.invalidate();
		utils.studio.getOne.invalidate({ id: videoId });
		onOpenChange(false);
	};
	return (
		<>
			<ResponsiveModal
				title='Upload a thumbnail'
				open={open}
				onOpenChange={onOpenChange}
			>
				<UploadDropzone
					endpoint='thumbnailUploader'
					input={{ videoId }}
					onClientUploadComplete={onClientUploadComplete}
				/>
			</ResponsiveModal>
		</>
	);
};
export default ThumbnailUploadModal;
