import {
	SidebarHeader,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/user-avatar';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

const StudioSidebarHeader = () => {
	const { user } = useUser();
	const { state } = useSidebar();

	// If there's no user, show skeletons
	if (!user) {
		return (
			<SidebarHeader>
				{/* Avatar skeleton */}
				<div className='flex items-center justify-center py-2'>
					<Skeleton className='h-[112px] w-[112px] rounded-full hover:opacity-80 transition-opacity shadow-md' />
				</div>

				{/* Name skeletons */}
				<div className='flex flex-col items-center'>
					<Skeleton className='h-4 w-20' />
					<Skeleton className='h-4 w-24 mt-1' />
				</div>
			</SidebarHeader>
		);
	}
	{
		if (state === 'collapsed') {
			return (
				<SidebarMenuItem>
					<SidebarMenuButton tooltip='Your profile' asChild>
						<Link href='/users/current'>
							<UserAvatar
								imageUrl={user?.imageUrl}
								name={user?.fullName ?? 'User'}
								size='sm'
							/>
							<span className='text-sm'>Your profile</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
			);
		}
	}

	// Otherwise, show actual user data
	return (
		<SidebarHeader>
			<div className='flex items-center justify-center py-2'>
				<Link href='/users/current'>
					<UserAvatar
						imageUrl={user.imageUrl}
						name={user.fullName ?? 'User'}
						className='size-[112px] hover:opacity-80 transition-opacity shadow-md'
					/>
				</Link>
			</div>

			<div className='flex items-center flex-col'>
				<p className='text-sm font-semibold'>Your Profile</p>
				<p className='text-xs'>{user.fullName}</p>
			</div>
		</SidebarHeader>
	);
};

export default StudioSidebarHeader;
