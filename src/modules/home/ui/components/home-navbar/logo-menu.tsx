import { SidebarTrigger } from '@/components/ui/sidebar';
import Image from 'next/image';
import Link from 'next/link';

const LogoMenu = () => {
	return (
		<div className='flex items-center flex-shrink-0'>
			<SidebarTrigger className='ml-1' />
			<Link href='/'>
				<div className='p-2.5 items-center flex gap-1'>
					<Image
						src='/play_logo.svg'
						alt='Logo'
						width={32}
						height={32}
						className='rounded-sm shadow-lg- shadow-slate-900'
					/>
					<p className='text-xl font-semibold tracking-tight text-gray-500'>
						Side
					</p>
					<p className='text-xl font-semibold tracking-wider text-blue-500'>
						TRACK
					</p>
				</div>
			</Link>
		</div>
	);
};
export default LogoMenu;
