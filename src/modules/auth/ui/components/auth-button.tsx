import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { UserCircleIcon } from 'lucide-react';

const AuthButton = () => {
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
				<UserButton></UserButton>
			</SignedIn>
		</>
	);
};
export default AuthButton;
