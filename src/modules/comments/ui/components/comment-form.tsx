import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';

import { useClerk, useUser } from '@clerk/nextjs';
import { trpc } from '@/trpc/client';
import { UserAvatar } from '@/components/user-avatar';
import { Textarea } from '@/components/ui/textarea';
import { commentInsertSchema } from '@/db/schema';
import { toast } from 'sonner';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form';

type CommentFormProps = {
	videoId: string;
	onSuccess?: () => void;
};

export const CommentForm = ({ videoId, onSuccess }: CommentFormProps) => {
	const { user } = useUser();
	const clerk = useClerk();
	const utils = trpc.useUtils();

	const create = trpc.comments.create.useMutation({
		onSuccess: () => {
			utils.comments.getMany.invalidate({ videoId });
			form.reset();
			toast.success('Your comment has been posted! 🎉');
			onSuccess?.();
		},
		onError: (error) => {
			toast.error('Something went wrong');

			if (error.data?.code === 'UNAUTHORIZED') {
				clerk.openSignIn();
			}
		},
	});

	const form = useForm<z.infer<typeof commentInsertSchema>>({
		resolver: zodResolver(commentInsertSchema.omit({ userId: true })),
		defaultValues: {
			videoId,
			value: '',
		},
	});

	const handleSubmit = (values: z.infer<typeof commentInsertSchema>) => {
		if (!values.value.trim()) {
			form.setError('value', { message: 'Share or add a comment' });
			return;
		}

		create.mutate({ ...values, value: values.value.trim() });
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className='flex gap-1 group '
			>
				<UserAvatar
					size='default'
					imageUrl={
						user?.imageUrl ||
						user?.firstName?.charAt(0) ||
						'/user_placeholder.svg'
					}
					name={user?.username || 'User'}
				/>

				<div className='flex-1 space-y-2 px-2'>
					<FormField
						name='value'
						control={form.control}
						render={({ field }) => (
							<FormItem>
								<FormControl>
									<Textarea
										{...field}
										placeholder='Add a comment...'
										className='resize-none bg-transparent overflow-hidden min-h-0'
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className='justify-end gap-2 pt-2 flex'>
						<Button type='submit' disabled={create.isPending} size='sm'>
							Comment
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
};
