import { auth } from '@clerk/nextjs/server';
import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import SuperJSON from 'superjson';
export const createTRPCContext = cache(async () => {
	const { userId } = await auth();
	return { clerkUserId: userId };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
	transformer: SuperJSON,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(
	async function isAuthorized(opts) {
		const { ctx } = opts;

		if (!ctx.clerkUserId) {
			throw new TRPCError({ code: 'UNAUTHORIZED' });
		}

		return opts.next({
			ctx: {
				...ctx,
			},
		});
	}
);
