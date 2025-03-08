'use client';

import { Separator } from '@/components/ui/separator';
import { CommentForm } from '@/modules/comments/ui/components/comment-form';
import CommentItem from '@/modules/comments/ui/components/comment-item';
import { trpc } from '@/trpc/client';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface Props {
	videoId: string;
}

export const CommentsSection = ({ videoId }: Props) => {
	return (
		<Suspense fallback={'Loading'}>
			<ErrorBoundary fallback={'error'}>
				<CommentsSectionSuspense videoId={videoId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const CommentsSectionSuspense = ({ videoId }: Props) => {
	const [comments] = trpc.comments.getMany.useSuspenseQuery({ videoId });
	return (
		<div className='mt-6 px-1'>
			<div className='flex flex-col gap-4 group'>
				<h1 className='text-xl font-bold'>0 comments</h1>
				<div>
					<CommentForm videoId={videoId} />
				</div>
				<Separator className='' />
				<div className='flex flex-col gap-4 mt-2'>
					{comments.map((comment) => (
						<CommentItem comment={comment} key={comment.id} />
					))}
				</div>
			</div>
		</div>
	);
};
