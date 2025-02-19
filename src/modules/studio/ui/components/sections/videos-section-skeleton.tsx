import { Skeleton } from '@/components/ui/skeleton';
import {
	TableHeader,
	TableRow,
	TableHead,
	TableBody,
	TableCell,
	Table,
} from '@/components/ui/table';

// Skeleton Table for Suspense Fallback
export const VideoSkeletonTable = () => (
	<div className='border-y'>
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className='pl-6 w-[510px]'>Video</TableHead>
					<TableHead>Visibility</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Date</TableHead>
					<TableHead>Views</TableHead>
					<TableHead>Comments</TableHead>
					<TableHead>Likes</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{Array(5)
					.fill(null)
					.map((_, index) => (
						<VideoSkeletonRow key={index} />
					))}
			</TableBody>
		</Table>
	</div>
);

// Skeleton Row for Table
export const VideoSkeletonRow = () => (
	<TableRow>
		<TableCell>
			<div className='flex items-center gap-4'>
				<Skeleton className='w-36 h-20 bg-gray-200' />
				<div className='flex flex-col gap-y-1'>
					<Skeleton className='h-4 w-48 bg-gray-200' />
					<Skeleton className='h-3 w-32 bg-gray-200' />
				</div>
			</div>
		</TableCell>
		<TableCell>
			<Skeleton className='h-4 w-20 bg-gray-200' />
		</TableCell>
		<TableCell>
			<Skeleton className='h-4 w-20 bg-gray-200' />
		</TableCell>
		<TableCell>
			<Skeleton className='h-4 w-24 bg-gray-200' />
		</TableCell>
		<TableCell>
			<Skeleton className='h-4 w-12 bg-gray-200' />
		</TableCell>
		<TableCell>
			<Skeleton className='h-4 w-12 bg-gray-200' />
		</TableCell>
		<TableCell>
			<Skeleton className='h-4 w-12 bg-gray-200' />
		</TableCell>
	</TableRow>
);
