import { ResultCategoriesSection } from '../sections/result-categories-section';
import { SearchCategoriesSection } from '../sections/search-categories-section';

interface SearchViewProps {
	query: string | undefined;
	categoryId: string | undefined;
}

const SearchView = ({ categoryId, query }: SearchViewProps) => {
	return (
		<div className='max-w-[110rem] mx-auto flex flex-col gap-6 pt-6'>
			<SearchCategoriesSection categoryId={categoryId} />
			<ResultCategoriesSection query={query} categoryId={categoryId} />
		</div>
	);
};
export default SearchView;
