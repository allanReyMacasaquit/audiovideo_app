'use client';

import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';
import {
	Carousel,
	CarouselApi,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from './ui/carousel';
import { Skeleton } from './ui/skeleton';
import { useEffect, useState } from 'react';

interface FilterCarouselProps {
	value?: string | null;
	isLoading?: boolean;
	onSelect: (value: string | null) => void;
	data: {
		value: string;
		label: string;
	}[];
}

const FilterCarousel = ({
	data,
	isLoading,
	onSelect,
	value,
}: FilterCarouselProps) => {
	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);
	const [count, setCount] = useState(0);

	useEffect(() => {
		if (!api) return;
		setCount(api.scrollSnapList().length);
		setCurrent(api.selectedScrollSnap() + 1);

		api.on('select', () => {
			setCurrent(api.selectedScrollSnap() + 1);
		});
	}, [api]);

	return (
		<div className='relative w-full'>
			{/* Left fade */}
			<div
				className={cn(
					'absolute left-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none',
					current === 1 && 'hidden'
				)}
			/>
			<Carousel
				setApi={setApi}
				opts={{ align: 'start', dragFree: true }}
				className='w-full px-12'
			>
				<CarouselContent className='-ml-3 flex gap-2'>
					{!isLoading && (
						<CarouselItem className='pl-3 basis-auto'>
							<Badge
								variant={!value ? 'default' : 'secondary'}
								className='cursor-pointer rounded-lg px-4 py-1 whitespace-nowrap text-sm'
							>
								All
							</Badge>
						</CarouselItem>
					)}

					{isLoading &&
						Array.from({ length: 14 }).map((_, index) => (
							<CarouselItem key={index} className='pl-3 basis-auto'>
								<Skeleton className='rounded-lg px-3 py-1 h-8 text-sm w-24 font-semibold '></Skeleton>
							</CarouselItem>
						))}
					{!isLoading &&
						data.map((item) => (
							<CarouselItem key={item.value} className='pl-3 basis-auto'>
								<Badge
									variant={value === item.value ? 'default' : 'secondary'}
									className='cursor-pointer rounded-lg px-3 py-1 whitespace-nowrap text-sm'
									onClick={() => onSelect?.(item.value)}
								>
									{item.label}
								</Badge>
							</CarouselItem>
						))}
				</CarouselContent>
				<CarouselPrevious className='left-0 z-20' />
				<CarouselNext className='right-0 z-20' />
			</Carousel>
			{/* Right fade */}
			<div
				className={cn(
					'absolute right-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none',
					current === count && 'hidden'
				)}
			/>
		</div>
	);
};
export default FilterCarousel;
