import { db } from '@/db';
import { subscriptions } from '@/db/schema';

import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

export const subscriptionsRouter = createTRPCRouter({
	create: protectedProcedure
		.input(z.object({ userId: z.string().uuid() }))
		.mutation(async ({ input, ctx }) => {
			const { userId } = input;

			if (userId === ctx.user.id) throw new TRPCError({ code: 'CONFLICT' });

			// Check if subscription already exists
			const existingSubscription = await db
				.select()
				.from(subscriptions)
				.where(
					and(
						eq(subscriptions.viewerId, ctx.user.id),
						eq(subscriptions.creatorId, userId)
					)
				)
				.limit(1);

			if (existingSubscription.length > 0) return null; // Do nothing if already subscribed

			const [createdSubscription] = await db
				.insert(subscriptions)
				.values({ viewerId: ctx.user.id, creatorId: userId })
				.returning();

			return createdSubscription;
		}),

	remove: protectedProcedure
		.input(z.object({ userId: z.string().uuid() }))
		.mutation(async ({ input, ctx }) => {
			const { userId } = input;

			if (userId === ctx.user.id) throw new TRPCError({ code: 'CONFLICT' });

			const [deletedSubscription] = await db
				.delete(subscriptions)
				.where(
					and(
						eq(subscriptions.viewerId, ctx.user.id),
						eq(subscriptions.creatorId, userId)
					)
				)
				.returning();

			return deletedSubscription;
		}),
});
