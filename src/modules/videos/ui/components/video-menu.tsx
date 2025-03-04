'use client';

import { Button } from '@/components/ui/button';
import {
	ListPlusIcon,
	MoreVertical,
	ShareIcon,
	Trash2Icon,
} from 'lucide-react';

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface VideoMenuProps {
	videoId?: string;
	variant?: 'ghost' | 'outline';
	onRemove?: () => void;
}

export const VideoMenu = ({
	videoId,
	variant = 'outline',
	onRemove,
}: VideoMenuProps) => {
	const onShare = () => {
		const fullUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}/videos/${videoId}`;
		navigator.clipboard.writeText(fullUrl);
		toast.success('Link copied to the clipboard');
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant={variant} size='icon' className='rounded-full ml-2'>
					<MoreVertical size={20} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' onClick={(e) => e.stopPropagation()}>
				<DropdownMenuItem onClick={onShare} className='cursor-pointer'>
					<ShareIcon className='mr-2 h-4 w-4' />
					Share
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => {}} className='cursor-pointer'>
					<ListPlusIcon className='mr-2 h-4 w-4' />
					Add to playlist
				</DropdownMenuItem>
				{onRemove && (
					<DropdownMenuItem onClick={() => {}} className='cursor-pointer'>
						<Trash2Icon className='mr-2 h-4 w-4' />
						Remove
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
