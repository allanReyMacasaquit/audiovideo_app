import { db } from '@/db';
import { videoViews } from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { z } from 'zod';

export const videoViewsRouter = createTRPCRouter({
	create: protectedProcedure
		.input(z.object({ videoId: z.string().uuid() }))
		.mutation(async ({ input, ctx }) => {
			const { videoId } = input;
			const userId = ctx.user.id;

			// Try inserting the view and ignore if it already exists
			const [createdVideoView] = await db
				.insert(videoViews)
				.values({ videoId, userId })
				.onConflictDoNothing() // Prevents duplicate entries
				.returning();

			return createdVideoView || { videoId, userId };
		}),
});
