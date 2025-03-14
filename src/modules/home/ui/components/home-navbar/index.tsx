import { SearchInput } from './search-input';
import AuthButton from '@/modules/auth/ui/components/auth-button';
import LogoMenu from './logo-menu';
import StudioUploadModal from '@/modules/modals/studio-upload-modal';

export const HomeNavbar = () => {
	return (
		<nav className='fixed top-0 left-0 right-0 h-16 bg-white flex items-center px-2 pr-5 z-50'>
			<div className='flex items-center justify-between gap-4 w-full'>
				<LogoMenu />
				<SearchInput />
				<div className='flex items-center gap-x-4'>
					<StudioUploadModal />
					<AuthButton />
				</div>
			</div>
		</nav>
	);
};
