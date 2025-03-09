'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreVerticalIcon, Trash2Icon } from 'lucide-react';

const VideoSectionFormSkeleton = () => {
	return (
		<>
			<div className='flex items-center justify-between mb-6 px-4'>
				<div>
					<Skeleton className='h-8 w-48 mb-2' />
					<Skeleton className='h-6 w-64' />
				</div>
				<div className='flex items-center gap-x-2'>
					<Button type='button' disabled>
						<Skeleton className='h-6 w-16' />
					</Button>
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<Button variant='ghost' size='icon' disabled>
								<MoreVerticalIcon />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuItem>
								<Button variant='ghost' className='flex' disabled>
									<Trash2Icon className='w-4 h-4 mr-2 text-red-500' /> Delete
								</Button>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-4 gap-6 px-4'>
				<div className='space-y-8 lg:col-span-2'>
					<div className='space-y-4'>
						<Skeleton className='h-6 w-32' />
						<Skeleton className='h-10 w-full' />
					</div>
					<div className='space-y-4'>
						<Skeleton className='h-6 w-32' />
						<Skeleton className='h-32 w-full' />
					</div>
					<div className='space-y-4'>
						<Skeleton className='h-6 w-32' />
						<Skeleton className='h-20 w-40 rounded-md' />
					</div>
					<div className='space-y-4'>
						<Skeleton className='h-6 w-32' />
						<Skeleton className='h-10 w-full' />
					</div>
				</div>

				<div className='flex flex-col gap-8 lg:col-span-2'>
					<div className='aspect-video bg-gray-200 rounded-xl' />
					<div className='flex flex-col gap-y-2'>
						<Skeleton className='h-4 w-24' />
						<Skeleton className='h-6 w-full' />
					</div>
					<div className='flex flex-col gap-y-2'>
						<Skeleton className='h-4 w-24' />
						<Skeleton className='h-6 w-full' />
					</div>
					<div className='flex flex-col gap-y-2'>
						<Skeleton className='h-4 w-24' />
						<Skeleton className='h-6 w-full' />
					</div>
				</div>
			</div>
		</>
	);
};

export default VideoSectionFormSkeleton;
