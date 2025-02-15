'use client';
import { trpc } from '@/trpc/client';
function ClientGreeting() {
	const [data] = trpc.hello.useSuspenseQuery({ text: 'allan2' });
	return <div>{data.greeting}</div>;
}

export default ClientGreeting;
