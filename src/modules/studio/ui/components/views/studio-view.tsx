'use client';

import { VideosSection } from '../sections/videos-section';

function StudioView() {
	return (
		<div className='max-w-[100rem] mx-auto px-4 mb-10 p-2 flex flex-col gap-y-6 border shadow '>
			<VideosSection />
		</div>
	);
}

export default StudioView;
