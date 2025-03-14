import { Button } from '@/components/ui/button';
import { trpc } from '@/trpc/client';
import { Loader2Icon } from 'lucide-react'; // Assuming you're using Lucide icons
import { formatDistanceToNow } from 'date-fns';
import CommentItem from './comment-item';

interface CommentRepliesProps {
	parentId: string;
	videoId: string;
}

const DEFAULT_LIMIT = 5;

export const CommentReplies = ({ parentId, videoId }: CommentRepliesProps) => {
	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		error,
	} = trpc.comments.getMany.useInfiniteQuery(
		{
			limit: DEFAULT_LIMIT,
			videoId,
			parentId,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	);

	// Flatten the paginated data into a single array
	const replies = data?.pages.flatMap((page) => page.items) || [];

	return (
		<div className='mt-2 ml-12'>
			<div>
				<div className='flex flex-col gap-4 mt-2'>
					{(isLoading || isFetchingNextPage) && (
						<div className='flex items-center justify-center'>
							<Loader2Icon className='size-6 animate-spin text-muted-foreground' />
						</div>
					)}

					{error && (
						<div className='text-destructive text-sm'>
							Error loading replies: {error.message}
						</div>
					)}

					{!isLoading && !isFetchingNextPage && replies.length === 0 && (
						<div className='text-muted-foreground text-sm'>No replies yet</div>
					)}

					{!isLoading &&
						replies.map((comment) => (
							<div
								key={comment.id}
								className='flex gap-3 py-2 group hover:bg-muted/50 transition-colors rounded-md px-2'
							>
								{/* CommentItem Integration */}
								<div className='flex-1'>
									<CommentItem
										key={comment.id}
										comment={comment}
										variant='reply'
									/>
									<span className='text-xs text-muted-foreground'>
										{formatDistanceToNow(new Date(comment.createdAt), {
											addSuffix: true,
										})}
									</span>
								</div>
							</div>
						))}

					{hasNextPage && (
						<Button
							variant='link'
							onClick={() => fetchNextPage()}
							className='text-sm p-0 h-auto text-muted-foreground hover:text-primary transition-colors'
							disabled={isFetchingNextPage}
						>
							{isFetchingNextPage ? 'Loading...' : 'Load more replies'}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
};

export default CommentReplies;
