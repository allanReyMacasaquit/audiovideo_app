import StudioView from '@/modules/studio/ui/components/views/studio-view';
import { trpc } from '@/trpc/server';
import { HydrateClient } from '@/trpc/server';

export const dynamic = 'force-dynamic';
export default async function StudioPage() {
	void trpc.studio.getMany.prefetchInfinite({ limit: 10 });
	return (
		<HydrateClient>
			<StudioView />
		</HydrateClient>
	);
}
