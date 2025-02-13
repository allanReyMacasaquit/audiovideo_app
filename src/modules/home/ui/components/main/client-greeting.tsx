import { trpc } from '@/trpc/server';
export default async function ClientGreeting() {
	// Use the caller directly without using `.prefetch()`
	const greeting = await trpc.hello({ text: 'Alla3' });
	//    ^? { greeting: string }
	return <div>Client Components says: {greeting.greeting}</div>;
}
