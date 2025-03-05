import { db } from '@/db';
import { videoReactions } from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

export const videoReactionsRouter = createTRPCRouter({
	like: protectedProcedure
		.input(z.object({ videoId: z.string().uuid() }))
		.mutation(async ({ input, ctx }) => {
			const { videoId } = input;
			const { id: userId } = ctx.user;

			// Check if a reaction already exists
			const [existingVideoReaction] = await db
				.select()
				.from(videoReactions)
				.where(
					and(
						eq(videoReactions.userId, userId),
						eq(videoReactions.videoId, videoId),
						eq(videoReactions.type, 'like')
					)
				);

			// If a reaction exists, delete it (toggle off the like)
			if (existingVideoReaction) {
				const [deletedLikedVideo] = await db
					.delete(videoReactions)
					.where(
						and(
							eq(videoReactions.userId, userId),
							eq(videoReactions.videoId, videoId)
						)
					)
					.returning();
				return deletedLikedVideo;
			}

			// Insert a new "like" reaction
			const [createdVideoLikedReaction] = await db
				.insert(videoReactions)
				.values({ userId, videoId, type: 'like' })
				.onConflictDoUpdate({
					target: [videoReactions.userId, videoReactions.videoId],
					set: {
						type: 'like',
					},
				})
				.returning();

			return createdVideoLikedReaction ?? { videoId, userId, type: 'like' };
		}),

	dislike: protectedProcedure
		.input(z.object({ videoId: z.string().uuid() }))
		.mutation(async ({ input, ctx }) => {
			const { videoId } = input;
			const { id: userId } = ctx.user;

			// Check if a reaction already exists
			const [existingVideoReaction] = await db
				.select()
				.from(videoReactions)
				.where(
					and(
						eq(videoReactions.userId, userId),
						eq(videoReactions.videoId, videoId),
						eq(videoReactions.type, 'dislike')
					)
				);

			// If a reaction exists, delete it (toggle off the like)
			if (existingVideoReaction) {
				const [deletedislikedVideo] = await db
					.delete(videoReactions)
					.where(
						and(
							eq(videoReactions.userId, userId),
							eq(videoReactions.videoId, videoId)
						)
					)
					.returning();
				return deletedislikedVideo;
			}

			// Insert a new "like" reaction
			const [createdVideodisLikedReaction] = await db
				.insert(videoReactions)
				.values({ userId, videoId, type: 'dislike' })
				.onConflictDoUpdate({
					target: [videoReactions.userId, videoReactions.videoId],
					set: {
						type: 'dislike',
					},
				})
				.returning();

			return (
				createdVideodisLikedReaction ?? { videoId, userId, type: 'dislike' }
			);
		}),
});
