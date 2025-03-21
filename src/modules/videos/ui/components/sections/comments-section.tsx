'use client'; // Marks this file as a client-side module in Next.js

// Import the InfiniteScroll component to handle loading additional data when scrolling.
import { InfiniteScroll } from '@/components/infinite-scroll';

// Import the CommentForm component which renders the form for submitting a new comment.
import { CommentForm } from '@/modules/comments/ui/components/comment-form';
// Import the CommentItem component used to display an individual comment.
import CommentItem from '@/modules/comments/ui/components/comment-item';
// Import the TRPC client for communicating with API endpoints.
import { trpc } from '@/trpc/client';
// Import React's Suspense component to allow for lazy-loading and displaying fallback content.
import { Suspense } from 'react';
// Import the ErrorBoundary component from 'react-error-boundary' to catch and handle runtime errors.
import { ErrorBoundary } from 'react-error-boundary';
// Import a fallback component that will be rendered if an error occurs within the component tree.
import FallbackSection from './fallback-section';

// Define the Props interface with a single property 'videoId' of type string.
interface Props {
	videoId: string;
}

// The main CommentsSection component wraps the content with Suspense and ErrorBoundary for improved error and loading state handling.
export const CommentsSection = ({ videoId }: Props) => {
	return (
		// Suspense displays the fallback content ("Loading") until its child components are ready.
		<Suspense fallback={'Loading'}>
			{/* ErrorBoundary catches errors in its child component tree and renders FallbackSection if an error occurs */}
			<ErrorBoundary fallback={<FallbackSection />}>
				{/* Render the actual comments section component that fetches and displays comments */}
				<CommentsSectionSuspense videoId={videoId} />
			</ErrorBoundary>
		</Suspense>
	);
};

// The CommentsSectionSuspense component fetches and displays comments using TRPC's infinite query hook.
const CommentsSectionSuspense = ({ videoId }: Props) => {
	// Destructure properties from the TRPC hook that retrieves paginated comments:
	// - data: the fetched comment data,
	// - fetchNextPage: function to load the next set of comments,
	// - hasNextPage: boolean indicating if more comments are available,
	// - isFetchingNextPage: boolean indicating if the next page is currently being fetched.
	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
		trpc.comments.getMany.useInfiniteQuery(
			{ videoId, limit: 5 }, // Query input: videoId and limit of comments per page.
			{
				// Define how to extract the next page cursor from the last page of data.
				getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
			}
		);

	// Combine all pages of comments into a single array; default to an empty array if no data is returned.
	const comments = data?.pages.flatMap((page) => page.items) ?? [];

	// Extract the totalCount from the first page (or 0 if it’s not loaded yet).
	const totalCount = data?.pages[0]?.totalCount ?? 0;

	return (
		// Main container with margin and padding styles.
		<div className='mt-6 px-4'>
			{/* Flex container for vertical arrangement with spacing between items */}
			<div className='flex flex-col gap-4 group'>
				{/* Display the total number of comments with conditional pluralization */}
				<h1 className='text-xl font-bold'>
					{totalCount} {totalCount === 1 ? 'comment' : 'comments'}
				</h1>
				{/* Render the CommentForm component to allow users to submit new comments */}
				<div>
					<CommentForm videoId={videoId} />
				</div>

				{/* Container for the list of comments */}
				<div className='flex flex-col gap-4 mt-2'>
					{/* Map over the comments array to render each comment using the CommentItem component */}
					{comments.map((comment) => (
						<CommentItem comment={comment} key={comment.id} />
					))}
				</div>
				{/* Render the InfiniteScroll component to load additional comments as the user scrolls */}
				<InfiniteScroll
					hasNextPage={hasNextPage}
					isFetchingNextPage={isFetchingNextPage}
					fetchNextPage={fetchNextPage}
				/>
			</div>
		</div>
	);
};
