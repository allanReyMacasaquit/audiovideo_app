import Link from 'next/link';
import { CommentsGetManyOutputType } from '../types';
import { UserAvatar } from '@/components/user-avatar';
import { formatDistanceToNow } from 'date-fns';

interface Props {
	comment: CommentsGetManyOutputType[number];
}

const CommentItem = ({ comment }: Props) => {
	return (
		<div className='border-b border-gray-200 dark:border-gray-700'>
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
				</div>
			</div>
		</div>
	);
};

export default CommentItem;
