import Link from 'next/link';
import { CommentsGetManyOutputType } from '../types';
import { UserAvatar } from '@/components/user-avatar';
import { formatDistanceToNow } from 'date-fns';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	MessageSquareIcon,
	MoreVerticalIcon,
	ThumbsDownIcon,
	ThumbsUpIcon,
	Trash2Icon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth, useClerk } from '@clerk/nextjs';
import { trpc } from '@/trpc/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
	comment: CommentsGetManyOutputType['items'][number];
}

const CommentItem = ({ comment }: Props) => {
	const { userId } = useAuth();
	const clerkId = useClerk();

	const utils = trpc.useUtils();

	const remove = trpc.comments.remove.useMutation({
		onSuccess: () => {
			toast.success('Comment has been deleted');
			utils.comments.getMany.invalidate({ videoId: comment.videoId });
		},
		onError: (error) => {
			toast.error('Something went wrong');
			if (error.data?.code === 'UNAUTHORIZED') {
				clerkId.openSignIn();
			}
		},
	});

	const like = trpc.commentReactions.like.useMutation({
		onSuccess: () => {
			utils.comments.getMany.invalidate({ videoId: comment.videoId });
		},
		onError: (error) => {
			if (error.data?.code === 'UNAUTHORIZED') {
				clerkId.openSignIn();
			}
		},
	});
	const dislike = trpc.commentReactions.dislike.useMutation({
		onSuccess: () => {
			utils.comments.getMany.invalidate({ videoId: comment.videoId });
		},
		onError: (error) => {
			if (error.data?.code === 'UNAUTHORIZED') {
				clerkId.openSignIn();
			}
		},
	});
	const isPending = like.isPending || dislike.isPending;

	return (
		<div className='border-b border-gray-200 dark:border-gray-700 flex items-start justify-between'>
			<div className='flex items-start gap-2'>
				{/* User Avatar */}
				<Link href={`/users/${comment.userId}`} className='shrink-0'>
					<UserAvatar
						imageUrl={comment.user.imageUrl}
						name={comment.user.name}
						size='default'
					/>
				</Link>

				<div className='flex flex-col mb-2'>
					{/* User Info */}
					<Link
						href={`/users/${comment.userId}`}
						className='font-semibold text-sm hover:underline'
					>
						{comment.user.name}
					</Link>
					<span className='text-xs text-gray-500'>
						{formatDistanceToNow(new Date(comment.createdAt), {
							addSuffix: true,
						})}
					</span>

					{/* Comment Text */}
					<p className='mt-1 text-sm text-gray-900 dark:text-gray-100'>
						{comment.value}
					</p>
					<div className='flex flex-col'>
						<div className='flex items-center'>
							<Button
								onClick={() => like.mutate({ commentId: comment.id })}
								disabled={isPending}
								variant='ghost'
								size='icon'
								className='size-8'
							>
								<ThumbsUpIcon
									className={cn(
										comment.viewerReaction === 'like' && 'fill-black'
									)}
								/>
							</Button>
							<span className='text-sm text-muted-foreground'>
								{comment.likeCount}
							</span>
							<Button
								onClick={() => dislike.mutate({ commentId: comment.id })}
								disabled={isPending}
								variant='ghost'
								size='icon'
								className='size-8'
							>
								<ThumbsDownIcon
									className={cn(
										comment.viewerReaction === 'dislike' && 'fill-black'
									)}
								/>
							</Button>
							<span className='text-sm text-muted-foreground'>
								{comment.dislikeCount}
							</span>
						</div>
					</div>
				</div>
			</div>
			<div className=''>
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<Button variant='ghost' size='icon' className='size-8'>
							<MoreVerticalIcon />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end'>
						<DropdownMenuItem onClick={() => {}}>
							<MessageSquareIcon className='text-green-400' />
							<span className='cursor-pointer'>Reply</span>
						</DropdownMenuItem>
						{comment.user.clerkId === userId && (
							<>
								<Separator />
								<DropdownMenuItem
									onClick={() => remove.mutate({ id: comment.id })}
								>
									<Trash2Icon className='text-red-500' />
									<span className='cursor-pointer'>Delete</span>
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
};

export default CommentItem;
