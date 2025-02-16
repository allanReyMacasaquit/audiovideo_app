'use client';

import { CategoriesSection } from '../sections/categories-section';

interface Props {
	categoryId: string;
}
function HomeView({ categoryId }: Props) {
	return (
		<div className='max-w-7xl mx-auto px-4 mb-10 p-2 flex flex-col gap-y-6 border shadow '>
			<CategoriesSection categoryId={categoryId} />
		</div>
	);
}

export default HomeView;
