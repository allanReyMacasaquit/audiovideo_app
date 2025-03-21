'use client';

import { Button } from '@/components/ui/button';
import { SearchIcon, XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const SearchInput = () => {
	const [value, setValue] = useState('');
	const router = useRouter();

	const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const url = new URL(
			'/search',
			process.env.VERCEL_URL || window.location.origin
		);
		const categoryValue = value.trim();

		if (categoryValue === '') {
			url.searchParams.delete('query');
		} else {
			url.searchParams.set('query', categoryValue);
		}

		setValue(categoryValue);
		router.push(url.toString());
	};

	return (
		<form onSubmit={handleSearch} className='flex w-full max-w-[600px]'>
			<div className='relative w-full'>
				<input
					value={value}
					onChange={(e) => setValue(e.target.value)}
					type='text'
					placeholder='Search'
					className='w-full pl-4 py-2 pr-12 rounded-l-full border focus:outline-none focus:border-blue-500'
				/>
				{value && (
					<Button
						onClick={() => setValue('')}
						disabled={!value.trim()}
						type='button'
						variant='ghost'
						size='icon'
						className='absolute right-2 top-1/2 -translate-y-1/2 rounded-full'
					>
						<XIcon />
					</Button>
				)}
			</div>
			<button
				type='submit'
				className='px-5 py-2 bg-gray-100 border border-l-0 rounded-r-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
			>
				<SearchIcon className='w-5 h-5' />
			</button>
		</form>
	);
};
