'use client';

import FilterCarousel from '@/components/filter-carousel';
import { trpc } from '@/trpc/client';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface Props {
	categoryId: string | undefined;
}

export const SearchCategoriesSection = ({ categoryId }: Props) => {
	return (
		<Suspense
			fallback={<FilterCarousel isLoading data={[]} onSelect={() => {}} />}
		>
			<ErrorBoundary fallback={<div>Something went wrong</div>}>
				<SearchCategoriesSectionSuspense categoryId={categoryId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const SearchCategoriesSectionSuspense = ({ categoryId }: Props) => {
	const [categories] = trpc.categories.getMany.useSuspenseQuery();
	const router = useRouter();

	const category = categories.map((category) => ({
		value: category.id,
		label: category.name,
	}));

	const onSelect = (value: string | null) => {
		const url = new URL(window.location.href);

		if (value) {
			url.searchParams.set('categoryId', value);
		} else {
			url.searchParams.delete('categoryId');
		}

		router.push(url.toString());
	};

	return (
		<FilterCarousel onSelect={onSelect} data={category} value={categoryId} />
	);
};
