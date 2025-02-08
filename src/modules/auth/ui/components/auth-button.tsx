import { Button } from '@/components/ui/button';
import { UserCircleIcon } from 'lucide-react';

const AuthButton = () => {
	return (
		<Button
			variant='outline'
			className='py-5 text-blue-600 text-lg hover:text-blue-500 rounded-full'
		>
			<UserCircleIcon />
			Sign in
		</Button>
	);
};
export default AuthButton;
