'use client';

import { InfiniteScroll } from '@/components/infinite-scroll';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

import { snakeCaseToTitle } from '@/lib/utils';
import VideoThumbnail from '@/modules/videos/ui/components/video-thumbnail';
import { trpc } from '@/trpc/client';
import { format } from 'date-fns';
import Link from 'next/link';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
	VideoSkeletonRow,
	VideoSkeletonTable,
} from './videos-section-skeleton';
import {
	Calendar,
	CheckCircle,
	Eye,
	EyeOffIcon,
	Globe,
	LockIcon,
	MessageSquareCodeIcon,
	ThumbsUpIcon,
	Video,
} from 'lucide-react';

export const VideosSection = () => {
	return (
		<Suspense fallback={<VideoSkeletonTable />}>
			<ErrorBoundary fallback={<div>Something went wrong</div>}>
				<StudioSectionSuspense />
			</ErrorBoundary>
		</Suspense>
	);
};

const StudioSectionSuspense = () => {
	const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
		{ limit: 5 },
		{ getNextPageParam: (lastPage) => lastPage.nextCursor }
	);

	return (
		<div>
			<div className='border-y'>
				<Table>
					<TableHeader className='shadow-md'>
						<TableRow className='bg-gray-100'>
							<TableHead className='pl-6'>
								<div className='flex items-center '>
									<Video className='w-4 h-4 mr-2' /> Video
								</div>
							</TableHead>
							<TableHead>
								<div className='flex items-center'>
									<CheckCircle className='w-4 h-4 mr-2' /> Status
								</div>
							</TableHead>
							<TableHead>
								<div className='flex items-center'>
									<Eye className='w-4 h-4 mr-2' /> Visibility
								</div>
							</TableHead>

							<TableHead>
								<div className='flex items-center'>
									<Calendar className='w-4 h-4 mr-2' /> Date
								</div>
							</TableHead>
							<TableHead>
								<div className='flex items-center'>
									<EyeOffIcon className='w-4 h-4 mr-2' /> Views
								</div>
							</TableHead>
							<TableHead>
								<div className='flex items-center'>
									<ThumbsUpIcon className='w-4 h-4 mr-2' /> Likes
								</div>
							</TableHead>
							<TableHead>
								<div className='flex items-center'>
									<MessageSquareCodeIcon className='w-4 h-4 mr-2' /> Comments
								</div>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{query.isLoading
							? Array(5)
									.fill(null)
									.map((_, index) => <VideoSkeletonRow key={index} />)
							: videos.pages
									.flatMap((page) => page.items)
									.map((video) => (
										<Link
											href={`/studio/videos/${video.id}`}
											key={video.id}
											legacyBehavior
										>
											<TableRow className='cursor-pointer'>
												<TableCell>
													<div className='flex items-center gap-4 px-4 py-2'>
														<div className='relative aspect-video w-36 shrink-0'>
															<VideoThumbnail
																imageUrl={video.thumbnailUrl}
																previewUrl={video.previewUrl}
																title={video.title}
																duration={video.duration || 0}
															/>
														</div>
														<div className='flex flex-col overflow-hidden gap-y-1'>
															<span className='text-sm line-clamp-1'>
																{video.title}
															</span>
															<span className='text-xs text-muted-foreground line-clamp-1'>
																{video.description || 'No Description'}
															</span>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div className='flex items-center'>
														{snakeCaseToTitle(video.muxStatus || 'error')}
													</div>
												</TableCell>
												<TableCell>
													<div className='flex items-center'>
														{video.visibility === 'private' ? (
															<LockIcon className='w-4 h-4 mr-2' />
														) : (
															<Globe className='w-4 h-4 mr-2' />
														)}
														{snakeCaseToTitle(video.visibility)}
													</div>
												</TableCell>
												<TableCell className='text-sm truncate'>
													<div className='flex items-center'>
														{format(new Date(video.createdAt), 'd MMM yyyy')}
													</div>
												</TableCell>
												<TableCell>Views</TableCell>
												<TableCell>Likes</TableCell>
												<TableCell>Comments</TableCell>
											</TableRow>
										</Link>
									))}
					</TableBody>
				</Table>
			</div>

			<InfiniteScroll
				isManual
				hasNextPage={query.hasNextPage}
				isFetchingNextPage={query.isFetchingNextPage}
				fetchNextPage={query.fetchNextPage}
			/>
		</div>
	);
};
