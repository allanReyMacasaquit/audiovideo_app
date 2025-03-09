'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { videoUpdateSchema } from '@/db/schema';
import { trpc } from '@/trpc/client';
import {
	Copy,
	DownloadIcon,
	ExternalLinkIcon,
	Globe,
	HourglassIcon,
	ImageIcon,
	Loader2Icon,
	LockIcon,
	MoreVerticalIcon,
	RotateCcwIcon,
	SparklesIcon,
	Trash2Icon,
	Video,
} from 'lucide-react';
import { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
	Form,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { VideoPlayer } from '@/modules/videos/ui/components/video-player';
import Link from 'next/link';
import { snakeCaseToTitle } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import VideoSectionFormSkeleton from './videos-form-skeleton';
import Image from 'next/image';
import ThumbnailUploadModal from '@/modules/modals/thumbnail-upload-modal';
import ThumbnailGenerateModal from '@/modules/modals/thumbnail-generate-modal';
import FallbackSection from '@/modules/videos/ui/components/sections/fallback-section';

interface Props {
	videoId: string;
}
export const VideosSectionForm = ({ videoId }: Props) => {
	return (
		<Suspense fallback={<VideoSectionFormSkeleton />}>
			<ErrorBoundary fallback={<FallbackSection />}>
				<VideosSectionFormSuspense videoId={videoId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const VideosSectionFormSuspense = ({ videoId }: Props) => {
	const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
	const [categories] = trpc.categories.getMany.useSuspenseQuery();
	const router = useRouter();
	const utils = trpc.useUtils();

	// State for the selected icon
	const [selectedIcon, setSelectedIcon] = useState(
		video.visibility === 'private' ? (
			<LockIcon className='h-4 w-4 mr-2' />
		) : (
			<Globe className='h-4 w-4 mr-2' />
		)
	);

	// State for the thumbnail modal
	const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);

	// State for the Generate thumbnail modal
	const [thumbnailGenerateModalOpen, setThumbnailGenerateModalOpen] =
		useState(false);

	const update = trpc.videos.update.useMutation({
		onSuccess: () => {
			utils.studio.getMany.invalidate();
			utils.studio.getOne.invalidate({ id: videoId });
			toast.success('Video updated');
		},
		onError: () => {
			toast.error('Something went wrong');
		},
	});
	const generateTitle = trpc.videos.generateTitle.useMutation({
		onSuccess: () => {
			toast.success('Background job started', {
				description: 'This may take sometime',
			});
		},
		onError: () => {
			toast.error('Something went wrong');
		},
	});

	const generateDescription = trpc.videos.generateDescription.useMutation({
		onSuccess: () => {
			toast.success('Background job started', {
				description: 'This may take sometime',
			});
		},
		onError: () => {
			toast.error('Something went wrong');
		},
	});

	const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
		onSuccess: () => {
			utils.studio.getMany.invalidate();
			utils.studio.getOne.invalidate({ id: videoId });
			toast.success('Thumbnail restored');
		},
		onError: () => {
			toast.error('Something went wrong');
		},
	});

	const remove = trpc.videos.remove.useMutation({
		onSuccess: () => {
			utils.studio.getMany.invalidate();
			toast.success('Video removed');
			router.push('/studio');
		},
		onError: () => {
			toast.error('Something went wrong');
		},
	});

	const form = useForm<z.infer<typeof videoUpdateSchema>>({
		resolver: zodResolver(videoUpdateSchema),
		defaultValues: video,
	});

	const onSubmit = async (data: z.infer<typeof videoUpdateSchema>) => {
		update.mutate(data);
	};

	// change URL if deploying outside VERCEL!
	const fullUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}/videos/${video.id}`;
	const [isCopying, setisCopying] = useState(false);

	const onCopy = async () => {
		await navigator.clipboard.writeText(fullUrl);
		setisCopying(true);

		setTimeout(() => {
			setisCopying(false);
		}, 2000);
	};

	const downloadImage = (imageUrl: string | null) => {
		if (!imageUrl) {
			toast.error('No image available to download.');
			return;
		}

		fetch(imageUrl)
			.then((response) => response.blob())
			.then((blob) => {
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = 'thumbnail.jpg'; // or any appropriate name
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
				toast.success('Thumbnail downloaded successfully.');
			})
			.catch(() => {
				toast.error('Failed to download the image.');
			});
	};

	return (
		<>
			<ThumbnailUploadModal
				open={thumbnailModalOpen}
				onOpenChange={setThumbnailModalOpen}
				videoId={videoId}
			/>
			<ThumbnailGenerateModal
				open={thumbnailGenerateModalOpen}
				onOpenChange={setThumbnailGenerateModalOpen}
				videoId={videoId}
			/>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className='flex items-center justify-between mb-6'>
						<div className='px-4'>
							<h1 className='text-2xl font-bold'>Video details</h1>
							<h2 className='text-muted-foreground'>
								Manage your video details
							</h2>
						</div>

						<div className='flex items-center gap-x-2 px-4'>
							{/* Save Button */}
							<Button type='submit' disabled={update.isPending}>
								Save
							</Button>

							{/* Dropdown Menu */}
							<DropdownMenu modal={false}>
								<DropdownMenuTrigger asChild>
									<Button variant='ghost' size='icon'>
										<MoreVerticalIcon /> {/* ✅ Fixed icon usage */}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align='end'>
									<DropdownMenuItem
										onClick={() => remove.mutate({ id: videoId })}
									>
										<Button variant={'ghost'} className='flex'>
											<Trash2Icon className='w-4 h-4 mr-2 text-red-500' />{' '}
											Delete
										</Button>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
					<div className='grid grid-cols-1 lg:grid-cols-4 gap-6 px-4'>
						<div className='space-y-8 lg:col-span-2'>
							<FormField
								control={form.control}
								name='title'
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<div className='flex items-center gap-x-2'>
												Title
												<Button
													variant='outline'
													type='button'
													className='rounded-full h-8 w-8 hover:shadow-md [&_svg]:size-3'
													onClick={() => generateTitle.mutate({ id: videoId })}
													disabled={
														generateTitle.isPending || !video.muxTrackId
													}
												>
													{generateTitle.isPending ? (
														<Loader2Icon className='h-4 w-4 animate-spin' />
													) : (
														<SparklesIcon className='h-4 w-4 text-orange-800' />
													)}
												</Button>
											</div>
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder='Add a title to your video'
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name='description'
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<div className='flex items-center gap-x-2'>
												Description
												<Button
													variant='outline'
													type='button'
													className='rounded-full h-8 w-8 border hover:shadow-md [&_svg]:size-3'
													onClick={() =>
														generateDescription.mutate({ id: videoId })
													}
													disabled={
														generateDescription.isPending || !video.muxTrackId
													}
												>
													{generateDescription.isPending ? (
														<Loader2Icon className='h-4 w-4 animate-spin' />
													) : (
														<SparklesIcon className='h-4 w-4 text-orange-800' />
													)}
												</Button>
											</div>
										</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												value={field.value ?? ''}
												rows={10}
												placeholder='Add a description to your video'
												className='resize-none pr-10'
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								name='thumbnailUrl'
								control={form.control}
								render={() => (
									<FormItem>
										<FormLabel>Thumbnail</FormLabel>
										<FormControl>
											<div className='p-0.5 border border-dashed border-neutral-400 relative h-[84px] w-[153px] group'>
												<Image
													src={video.thumbnailUrl ?? '/thumbnail.svg'}
													fill
													alt='Thumbnail'
													className='object-cover'
												/>
												<DropdownMenu modal={false}>
													<DropdownMenuTrigger asChild>
														<Button
															type='button'
															size='icon'
															className='bg-black/50 hover:bg-black/50 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 duration-300 size-7'
														>
															<MoreVerticalIcon className='text-white' />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent
														align='start'
														side='right'
														className='mx-2'
													>
														<DropdownMenuItem
															onClick={() => setThumbnailModalOpen(true)}
														>
															<ImageIcon className='h4 w-4' /> Change
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																setThumbnailGenerateModalOpen(true)
															}
														>
															<SparklesIcon className='h4 w-4' /> AI generated
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																restoreThumbnail.mutate({ id: videoId })
															}
														>
															<RotateCcwIcon className='h4 w-4' /> Restore
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => downloadImage(video.thumbnailUrl)}
														>
															<DownloadIcon className='h4 w-4' /> Download
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</FormControl>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='categoryId'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Category</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value ?? undefined}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder='Select a category'></SelectValue>
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{categories.map((category) => (
													<SelectItem key={category.id} value={category.id}>
														{category.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>

										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<div className='flex flex-col gap-8 lg:col-span-2'>
							<div className='flex flex-col gap-6  overflow-hidden py-4'>
								<div className='aspect-video overflow-hidden relative rounded-xl px-2.5 pt-1'>
									<VideoPlayer
										playbackId={video.muxPlaybackId}
										thumbnailUrl={video.thumbnailUrl}
									/>
								</div>

								<div className=' flex justify-between items-center gap-x-2'>
									<div className='flex flex-col gap-y-1'>
										<p className='text-muted-foreground text-xs flex'>
											<ExternalLinkIcon className='w-4 h-4 mr-2' /> Video Lnk
										</p>

										<div className='relative flex items-center'>
											<Link href={`/videos/${video.id}`}>
												<p className='line-clamp-1 text-sm text-blue-500'>
													{fullUrl}
												</p>
											</Link>
											<div className='absolute right-[65px] top-0 bottom-0 w-[65px] z-10 bg-gradient-to-l from-white to-transparent pointer-events-none shadow-none border-none'></div>
											<Button
												type='button'
												onClick={onCopy}
												disabled={isCopying}
												className='px-1.5'
											>
												{isCopying ? (
													<p className='flex items-center gap-x-5'>
														<Copy className='animate-spin' /> Copied
													</p>
												) : (
													<p className='flex items-center gap-x-1'>
														<Copy /> Copy
													</p>
												)}
											</Button>
										</div>
									</div>
								</div>
								<div className='flex justify-between items-center'>
									<div className='flex flex-col gap-y-1'>
										<div className='text-muted-foreground text-xs flex'>
											<Video className='w-4 h-4 mr-2' />
											Video Status
										</div>
										<div
											className={`text-sm ${
												(!video.muxStatus || video.muxStatus === 'preparing') &&
												'animate-pulse'
											}`}
										>
											{snakeCaseToTitle(video.muxStatus || 'preparing...')}
										</div>
									</div>
								</div>

								<div className='flex justify-between items-center'>
									<div className='flex flex-col gap-y-1'>
										<div className='text-muted-foreground text-xs flex'>
											<HourglassIcon className='w-4 h-4 mr-2' />
											Subtitle Status
										</div>
										<div
											className={`text-sm ${
												(!video.muxTrackStatus ||
													video.muxTrackStatus === 'waiting') &&
												'animate-pulse'
											}`}
										>
											{snakeCaseToTitle(
												video.muxTrackStatus || ' audio processing...'
											)}
										</div>
									</div>
								</div>
								<FormField
									control={form.control}
									name='visibility'
									render={({ field }) => (
										<FormItem>
											<FormLabel className='flex items-center text-muted-foreground text-sm'>
												{selectedIcon} Visibility
												<Select
													onValueChange={(value) => {
														field.onChange(value);
														setSelectedIcon(
															value === 'private' ? (
																<LockIcon className='h-4 w-4 mr-2' />
															) : (
																<Globe className='h-4 w-4 mr-2' />
															)
														);
													}}
													defaultValue={field.value ?? undefined}
												>
													<FormControl className='mx-2'>
														<SelectTrigger>
															<SelectValue placeholder='Select Visibility' />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value='public'>
															<div className='flex'>
																<Globe className='h-4 w-4 mr-2' /> Public
															</div>
														</SelectItem>
														<SelectItem value='private'>
															<div className='flex'>
																<LockIcon className='h-4 w-4 mr-2' /> Private
															</div>
														</SelectItem>
													</SelectContent>
												</Select>
											</FormLabel>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>
					</div>
				</form>
			</Form>
		</>
	);
};
