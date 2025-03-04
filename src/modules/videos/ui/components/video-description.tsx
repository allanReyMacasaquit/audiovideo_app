import { cn } from '@/lib/utils';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useState } from 'react';

interface VideoDescriptionProps {
	compactViews: string;
	expandedViews: string;
	compactDate: string;
	expandedDate: string;
	description?: string | null;
}

const VideoDescription: React.FC<VideoDescriptionProps> = ({
	compactViews,
	expandedViews,
	compactDate,
	expandedDate,
	description,
}) => {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<div
			className='bg-secondary/50 rounded-xl p-3 cursor-pointer hover:bg-secondary/70 transition'
			onClick={() => setIsExpanded((current) => !current)}
		>
			<div className='flex gap-2 text-sm mb-2'>
				<span className='font-medium'>
					{isExpanded ? expandedViews : compactViews} views
				</span>
				<span className='font-medium'>
					{isExpanded ? expandedDate : compactDate}
				</span>
			</div>
			<div className='relative'>
				<p
					className={cn(
						'text-sm whitespace-pre-wrap',
						!isExpanded && ' line-clamp-2'
					)}
				>
					{description || 'No Description available'}
				</p>
				<div className='flex items-center gap-1 mt-4 text-sm font-medium'>
					{isExpanded ? (
						<>
							Show less <ChevronUpIcon className='h-4 w-4 animate-bounce' />
						</>
					) : (
						<>
							Show more...{' '}
							<ChevronDownIcon className='h-4 w-4 animate-bounce' />
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default VideoDescription;
