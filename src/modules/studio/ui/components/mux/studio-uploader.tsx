import MuxUploader, {
	MuxUploaderDrop,
	MuxUploaderFileSelect,
	MuxUploaderProgress,
	MuxUploaderStatus,
} from '@mux/mux-uploader-react';
import { UploadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudioUploaderProps {
	endpoint?: string | null;
	onSuccess: () => void;
}

export const StudioUploader = ({
	endpoint,
	onSuccess,
}: StudioUploaderProps) => {
	const getUploadUrl = async () => {
		if (!endpoint) {
			throw new Error('No endpoint provided');
		}
		const response = await fetch(endpoint);
		const data = await response.json();
		console.log(data);

		return data.uploadUrl;
	};
	return (
		<div className='flex flex-col items-center gap-4 p-4 rounded-lg w-full'>
			{endpoint ? (
				<div>
					<MuxUploader
						endpoint={getUploadUrl}
						onSuccess={onSuccess}
						id='mux-uploader'
						className='hidden group/uploader'
					/>
					<MuxUploaderDrop muxUploader='mux-uploader' className='group/drop'>
						<div
							slot='heading'
							className='flex flex-col items-center gap-6 cursor-pointer'
						>
							<div className=' flex items-center justify-center gap-2 rounded-full border bg-muted h-32 w-32'>
								<UploadIcon className='size-10 text-muted-foreground group/drop-[&[active]]:animate-bounce transition-all duration-300' />
							</div>
							<div className='flex flex-col gap-2 text-center'>
								<p className='text-sm'>Drag and Drop video</p>
								<p className='text-xs text-muted-foreground'>
									Your videos will be private until you publish them
								</p>
							</div>
							<MuxUploaderFileSelect muxUploader='mux-uploader'>
								<Button type='button' className='rounded-full'>
									Select a File
								</Button>
							</MuxUploaderFileSelect>
						</div>
						<span slot='separator' className='hidden'></span>
						<MuxUploaderStatus muxUploader='mux-uploader' className='text-sm' />
						<div className='flex items-center flex-col w-96'>
							<MuxUploaderProgress
								muxUploader='mux-uploader'
								type='percentage'
								className='text-sm'
							/>

							<MuxUploaderProgress
								muxUploader='mux-uploader'
								type='bar'
								className='text-sm'
							/>
						</div>
					</MuxUploaderDrop>
				</div>
			) : (
				<p className='text-red-500'>No upload endpoint provided.</p>
			)}
		</div>
	);
};
