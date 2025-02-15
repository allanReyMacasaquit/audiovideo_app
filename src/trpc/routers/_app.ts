import { z } from 'zod';
import { protectedProcedure, createTRPCRouter } from '../init';

export const appRouter = createTRPCRouter({
	hello: protectedProcedure
		.input(z.object({ text: z.string() }))
		.query(({ ctx, input }) => {
			if (!ctx.clerkUserId) {
				throw new Error('Unauthorized');
			}
			console.log(`context clerkID ${ctx.clerkUserId}`);

			return {
				greeting: `Hi ${input.text}`,
			};
		}),
});
// export type definition of API
export type AppRouter = typeof appRouter;
