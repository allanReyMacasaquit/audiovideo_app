'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
	useUser,
} from '@clerk/nextjs';
import { ClapperboardIcon, UserCircleIcon } from 'lucide-react';

const AuthButton = () => {
	const { isLoaded } = useUser();

	// 1. If the user data is still loading, show a skeleton placeholder
	if (!isLoaded) {
		return <Skeleton className='h-7 w-7 rounded-full' />;
	}

	// 2. If loaded, show either the sign-in button or the user button
	return (
		<>
			<SignedOut>
				<SignInButton mode='modal'>
					<Button
						variant='outline'
						className='py-5 text-blue-600 text-lg hover:text-blue-500 rounded-full'
					>
						<UserCircleIcon />
						Sign in
					</Button>
				</SignInButton>
			</SignedOut>

			<SignedIn>
				<UserButton>
					<UserButton.MenuItems>
						<UserButton.Link
							label='Studio'
							href='/studio'
							labelIcon={<ClapperboardIcon />}
						/>
						<UserButton.Action label='manageAccount' />
					</UserButton.MenuItems>
				</UserButton>
			</SignedIn>
		</>
	);
};

export default AuthButton;
