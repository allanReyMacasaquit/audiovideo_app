import { trpc } from '@/trpc/server';
import { HydrateClient } from '@/trpc/server';
import HomeView from '@/modules/home/ui/components/views/home-view';

interface Props {
	searchParams: Promise<{ categoryId: string }>;
}

export const dynamic = 'force-dynamic';
export default async function Home({ searchParams }: Props) {
	const { categoryId } = await searchParams;
	void trpc.categories.getMany.prefetch();
	return (
		<HydrateClient>
			<HomeView categoryId={categoryId} />
		</HydrateClient>
	);
}
