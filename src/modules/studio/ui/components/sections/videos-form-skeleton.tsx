'use client';

const VideoSectionFormSkeleton = () => {
	return (
		<div className='animate-pulse'>
			{/* Header Skeleton */}
			<div className='flex items-center justify-between mb-6 px-4'>
				<div>
					<div className='h-8 bg-gray-200 rounded w-48 mb-2'></div>
					<div className='h-4 bg-gray-200 rounded w-32'></div>
				</div>
				<div className='flex items-center gap-x-2 px-4'>
					<div className='h-8 w-16 bg-gray-200 rounded'></div>
					<div className='h-8 w-8 bg-gray-200 rounded-full'></div>
				</div>
			</div>

			{/* Form Skeleton */}
			<div className='grid grid-cols-1 lg:grid-cols-4 gap-6 px-4'>
				{/* Left side fields */}
				<div className='space-y-8 lg:col-span-2'>
					{/* Title skeleton */}
					<div className='h-10 bg-gray-200 rounded'></div>
					{/* Description skeleton */}
					<div className='h-32 bg-gray-200 rounded'></div>
					{/* Category skeleton */}
					<div className='h-10 bg-gray-200 rounded'></div>
				</div>

				{/* Right side preview skeleton */}
				<div className='flex flex-col gap-8 lg:col-span-2'>
					<div className='h-64 bg-gray-200 rounded'></div>
					<div className='flex flex-col gap-y-4'>
						<div className='h-8 bg-gray-200 rounded w-32'></div>
						<div className='h-4 bg-gray-200 rounded w-64'></div>
					</div>
					<div className='flex flex-col gap-y-4'>
						<div className='h-8 bg-gray-200 rounded w-32'></div>
						<div className='h-4 bg-gray-200 rounded w-64'></div>
					</div>
					<div className='flex flex-col gap-y-4'>
						<div className='h-8 bg-gray-200 rounded w-32'></div>
						<div className='h-4 bg-gray-200 rounded w-64'></div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default VideoSectionFormSkeleton;
