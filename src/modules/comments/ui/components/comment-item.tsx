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
	ChevronRightIcon,
	MessageSquareIcon,
	MoreVerticalIcon,
	ThumbsDownIcon,
	ThumbsUpIcon,
	Trash2Icon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth, useClerk } from '@clerk/nextjs';
import { trpc } from '@/trpc/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { CommentForm } from './comment-form';
import CommentReplies from './comment-replies';

interface Props {
	comment: CommentsGetManyOutputType['items'][number];
	variant?: 'reply' | 'comment';
}

const CommentItem = ({ comment, variant = 'comment' }: Props) => {
	const [isReplyOpen, setIsReplyOpen] = useState(false);
	const [isRepliesOpen, setIsRepliesOpen] = useState(false);

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
		<>
			<div className='flex items-start justify-between'>
				<div className='flex items-start gap-2'>
					{/* User Avatar */}
					<Link href={`/users/${comment.userId}`} className='shrink-0'>
						{variant === 'reply' ? (
							<UserAvatar
								imageUrl={comment.user.imageUrl}
								name={comment.user.name}
								size='md'
							/>
						) : (
							<UserAvatar
								imageUrl={comment.user.imageUrl}
								name={comment.user.name}
								size='default'
							/>
						)}
					</Link>

					<div className='flex flex-col mb-2'>
						{/* User Info */}
						<Link
							href={`/users/${comment.userId}`}
							className='font-semibold text-sm hover:underline'
						>
							{comment.user.name}
						</Link>
						<span className='text-xs text-gray-500 flex items-center'>
							{formatDistanceToNow(new Date(comment.createdAt), {
								addSuffix: true,
							})}
						</span>

						{/* Comment Text */}
						<p className='mt-1 text-sm text-gray-900 dark:text-gray-100'>
							{comment.value}
						</p>
						<div className='flex flex-col'>
							<div className='flex items-center gap-2'>
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
								{variant === 'comment' && (
									<Button
										onClick={() => setIsReplyOpen((prev) => !prev)}
										variant='ghost'
										size='sm'
										className='h-8 hover:text-blue-700'
									>
										Reply
									</Button>
								)}
							</div>
						</div>
					</div>
				</div>
				{comment.user.clerkId === userId ? (
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<Button variant='ghost' size='icon' className='size-8'>
								<MoreVerticalIcon />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							{variant === 'comment' && (
								<DropdownMenuItem onClick={() => setIsReplyOpen(true)}>
									<MessageSquareIcon className='text-green-400' />
									<span className='cursor-pointer'>Reply</span>
								</DropdownMenuItem>
							)}

							<DropdownMenuItem
								onClick={() => remove.mutate({ id: comment.id })}
							>
								<Trash2Icon className='text-red-500' />
								<span className='cursor-pointer'>Delete</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					''
				)}
			</div>
			<div>
				{isReplyOpen && variant === 'comment' && (
					<>
						<div className='pl-14'>
							<CommentForm
								variant='reply'
								parentId={comment.id}
								videoId={comment.videoId}
								onSuccess={() => {
									setIsReplyOpen(false);
									setIsRepliesOpen(true);
									// Invalidate to refresh the comment and its replies
									utils.comments.getMany.invalidate({
										videoId: comment.videoId,
									});
								}}
								onCancel={() => setIsReplyOpen(false)}
							/>
						</div>
					</>
				)}
				{comment?.replyCount && variant === 'comment' && (
					<Button
						variant='ghost'
						size='sm'
						className='text-xs hover:text-blue-700 ml-10'
						onClick={() => setIsRepliesOpen((prev) => !prev)}
						aria-expanded={isRepliesOpen}
						aria-controls='replies-section'
					>
						<span className='flex items-center'>
							<MessageSquareIcon className='mr-1' />
							{comment.replyCount}{' '}
							{comment.replyCount === 1 ? 'Reply' : 'Replies'}
							<ChevronRightIcon
								className={cn(
									'w-4 h-4 ml-2 transition-transform',
									isRepliesOpen && 'rotate-90'
								)}
							/>
						</span>
					</Button>
				)}
				{comment.replyCount > 0 && variant === 'comment' && isRepliesOpen && (
					<CommentReplies parentId={comment.id} videoId={comment.videoId} />
				)}
			</div>
		</>
	);
};

export default CommentItem;
