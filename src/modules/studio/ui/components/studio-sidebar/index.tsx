'use client';

import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { LogOutIcon, VideoIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import StudioSidebarHeader from './studio-sidebar-header';
import { Separator } from '@/components/ui/separator';

const StudioSidebar = () => {
	const pathname = usePathname();
	return (
		<Sidebar className='pt-16 z-40 border-none' collapsible='icon'>
			<SidebarContent className='border-2 flex flex-col justify-between h-full'>
				<SidebarGroup>
					<SidebarMenu>
						<StudioSidebarHeader />

						<SidebarMenuItem>
							<SidebarMenuButton
								isActive={pathname === '/studio'}
								tooltip='Content'
								asChild
							>
								<Link href='/studio'>
									<VideoIcon className='size-5' />
									<span className='text-lg font-semibold'>Content</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>

				<div className='p-1.5'>
					<Separator />
					<SidebarMenuButton tooltip='Exit studio' asChild>
						<Link href='/'>
							<LogOutIcon className='size-5' />
							<span className='text-sm'>Exit studio</span>
						</Link>
					</SidebarMenuButton>
				</div>
			</SidebarContent>
		</Sidebar>
	);
};
export default StudioSidebar;
