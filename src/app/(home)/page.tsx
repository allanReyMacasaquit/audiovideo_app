import { trpc } from '@/trpc/server';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HydrateClient } from '@/trpc/server';

import ClientGreeting from '@/modules/home/ui/components/main/client-greeting';
export default async function Home() {
	void trpc.hello.prefetch({ text: 'allan2' });
	return (
		<HydrateClient>
			<ErrorBoundary fallback={<div>Something went wrong</div>}>
				<Suspense fallback={<div>Loading...</div>}>
					<ClientGreeting />
				</Suspense>
			</ErrorBoundary>
		</HydrateClient>
	);
}
