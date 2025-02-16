'use client';

import { Button } from '@/components/ui/button';
import { UploadIcon } from 'lucide-react';

const StudioUploadModal = () => {
	return (
		<Button variant='secondary'>
			<UploadIcon />
			Upload
		</Button>
	);
};
export default StudioUploadModal;
