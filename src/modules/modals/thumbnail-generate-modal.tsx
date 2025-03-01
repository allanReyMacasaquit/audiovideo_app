'use client';

import { trpc } from '@/trpc/client';
import { ResponsiveModal } from './responsive-modal';
import { z } from 'zod';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ThumbnailModalProps {
	open: boolean;
	videoId: string;
	onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
	prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
});

const ThumbnailGenerateModal = ({
	videoId,
	open,
	onOpenChange,
}: ThumbnailModalProps) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { prompt: '' },
	});

	const onSubmit = (values: z.infer<typeof formSchema>) => {
		generateThumbnail.mutate({
			id: videoId,
			prompt: values.prompt,
		});
	};

	const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
		onSuccess: () => {
			toast.success('Background job started', {
				description: 'This may take sometime',
			});
			form.reset();
			onOpenChange(false);
		},
		onError: () => {
			toast.error('Something went wrong');
		},
	});

	return (
		<ResponsiveModal
			title='Upload a thumbnail'
			open={open}
			onOpenChange={onOpenChange}
		>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className='flex flex-col gap-4 space-y-4'
				>
					<FormField
						control={form.control}
						name='prompt'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Thumbnail Prompt</FormLabel>
								<FormControl>
									<Textarea
										placeholder='Enter thumbnail prompt'
										{...field}
										className='resize-none'
										cols={30}
										rows={5}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className='flex justify-end'>
						<Button type='submit' disabled={generateThumbnail.isPending}>
							Generate
						</Button>
					</div>
				</form>
			</Form>
		</ResponsiveModal>
	);
};

export default ThumbnailGenerateModal;
