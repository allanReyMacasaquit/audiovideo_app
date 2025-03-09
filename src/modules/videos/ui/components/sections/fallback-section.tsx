import { CogIcon } from 'lucide-react';

const FallbackSection = () => {
	return (
		<div className='justify-center items-center flex flex-col h-screen rounded-md'>
			<div className='p-4 bg-slate-500 rounded-md text-white'>
				<div className='flex'>
					<h1 className='animate-pulse font-semibold text-3xl tracking-widest'>
						SERVER ERROR
					</h1>
					<span>
						<CogIcon className='animate-spin' />
					</span>
				</div>
				<span>Call your Administrator</span>
			</div>
		</div>
	);
};
export default FallbackSection;
