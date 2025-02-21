'use client';

import { VideosSection } from '../sections/videos-section';

const StudioView = () => {
	return (
		<div className='max-w-[110rem] mx-auto flex flex-col gap-6 pt-6'>
			{/* Header Section */}
			<div className='px-6'>
				<h1 className='text-2xl font-bold'>Channel content</h1>
				<h2 className='text-muted-foreground'>
					Manage your channel content and videos
				</h2>
			</div>

			{/* Videos Section */}
			<VideosSection />
		</div>
	);
};

export default StudioView;
