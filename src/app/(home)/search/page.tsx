import SearchView from '@/modules/search/ui/views/search-view';
import { HydrateClient, trpc } from '@/trpc/server';

export const dynamic = 'force-dynamic';

interface SearchProps {
	searchParams: Promise<{
		query: string | undefined;
		categoryId: string | undefined;
	}>;
}

const SearchPage = async ({ searchParams }: SearchProps) => {
	const { query, categoryId } = await searchParams;

	void trpc.categories.getMany.prefetch();
	void trpc.search.getMany.prefetchInfinite({
		query,
		categoryId,
		limit: 5,
	});

	return (
		<HydrateClient>
			<SearchView query={query} categoryId={categoryId} />
			Searching for {query} in Category {categoryId}
		</HydrateClient>
	);
};
export default SearchPage;
