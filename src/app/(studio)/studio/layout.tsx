import StudioLayout from '@/modules/studio/layout/page';
import React from 'react';

interface LayoutPageProps {
	children: React.ReactNode;
}
const StudioPage = ({ children }: LayoutPageProps) => {
	return <StudioLayout>{children}</StudioLayout>;
};
export default StudioPage;
