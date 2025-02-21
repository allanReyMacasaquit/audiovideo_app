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
	Check,
	Copy,
	ExternalLinkIcon,
	Globe,
	HourglassIcon,
	LockIcon,
	MoreVerticalIcon,
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

interface Props {
	videoId: string;
}
export const VideosSectionForm = ({ videoId }: Props) => {
	return (
		<Suspense fallback='Loading...'>
			<ErrorBoundary fallback={<div>Something went wrong</div>}>
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

	const update = trpc.videos.update.useMutation({
		onSuccess: () => {
			utils.studio.getMany.invalidate();
			utils.studio.getOne.invalidate({ id: videoId });
			toast.success('Video updated');
		},
		onError: () => {
			toast.error('Somethind went wrong');
		},
	});

	const remove = trpc.videos.remove.useMutation({
		onSuccess: () => {
			utils.studio.getMany.invalidate();
			toast.success('Video removed');
			router.push('/studio');
		},
		onError: () => {
			toast.error('Somethind went wrong');
		},
	});

	const form = useForm<z.infer<typeof videoUpdateSchema>>({
		resolver: zodResolver(videoUpdateSchema),
		defaultValues: video,
	});

	// State for the selected icon
	const [selectedIcon, setSelectedIcon] = useState(
		video.visibility === 'private' ? (
			<LockIcon className='h-4 w-4 mr-2' />
		) : (
			<Globe className='h-4 w-4 mr-2' />
		)
	);

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
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className='flex items-center justify-between mb-6'>
					<div className='px-4'>
						<h1 className='text-2xl font-bold'>Video details</h1>
						<h2 className='text-muted-foreground'>Manage your video details</h2>
					</div>

					<div className='flex items-center gap-x-2 px-4'>
						{/* Save Button */}
						<Button type='submit' disabled={update.isPending}>
							Save
						</Button>

						{/* Dropdown Menu */}
						<DropdownMenu>
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
										<Trash2Icon className='w-4 h-4 mr-2 text-red-500' /> Delete
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
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input {...field} placeholder='Add a title to your video' />
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
									<FormLabel>Description</FormLabel>
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
						<div className='flex flex-col gap-6 overflow-hidden h-full p-4 rounded-2xl'>
							<div className='aspect-video shadow-lg shadow-black overflow-hidden relative rounded-2xl'>
								<VideoPlayer
									playbackId={video.muxPlaybackId}
									thumbnailUrl={video.thumbnailUrl}
								/>
							</div>

							<div className='flex justify-between items-center gap-x-2'>
								<div className='flex flex-col gap-y-1'>
									<p className='text-muted-foreground text-xs flex'>
										<ExternalLinkIcon className='w-4 h-4 mr-2' /> Video Lnk
									</p>
									<div className='flex items-center gap-x-2'>
										<Link href={`/videos/${video.id}`}>
											<p className='line-clamp-1 text-sm text-blue-500'>
												{fullUrl}
											</p>
										</Link>
										<Button type='button' onClick={onCopy} disabled={isCopying}>
											{isCopying ? (
												<p className='flex items-center gap-x-2'>
													<Check /> Copied
												</p>
											) : (
												<p className='flex items-center gap-x-2'>
													<Copy /> Copy
												</p>
											)}
										</Button>
									</div>
								</div>
							</div>
							<div className='flex justify-between items-center'>
								<div className='flex flex-col gap-y-1'>
									<p className='text-muted-foreground text-xs flex'>
										<Video className='w-4 h-4 mr-2' />
										Video Status
									</p>
									<p className='text-sm'>
										{snakeCaseToTitle(video.muxStatus || 'preparing')}
									</p>
								</div>
							</div>
							<div className='flex justify-between items-center'>
								<div className='flex flex-col gap-y-1'>
									<p className='text-muted-foreground text-xs flex'>
										<HourglassIcon className='w-4 h-4 mr-2' />
										Subtitle Status
									</p>
									<p className='text-sm'>
										{snakeCaseToTitle(video.muxTrackStatus || 'no_subtitle')}
									</p>
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
	);
};
