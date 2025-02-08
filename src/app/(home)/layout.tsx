import React from 'react';
import HomeLayout from '@/modules/home/ui/layout/page';

interface LayoutPageProps {
	children: React.ReactNode;
}
const LayoutPage = ({ children }: LayoutPageProps) => {
	return <HomeLayout>{children}</HomeLayout>;
};
export default LayoutPage;
