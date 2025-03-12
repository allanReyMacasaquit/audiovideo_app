import { db } from '@/db';
import { commentReactions } from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

export const commentReactionsRouter = createTRPCRouter({
	like: protectedProcedure
		.input(z.object({ commentId: z.string().uuid() }))
		.mutation(async ({ input, ctx }) => {
			const { commentId } = input;
			const { id: userId } = ctx.user;

			// Check if a reaction already exists
			const [existingCommentReactions] = await db
				.select()
				.from(commentReactions)
				.where(
					and(
						eq(commentReactions.userId, userId),
						eq(commentReactions.commentId, commentId),
						eq(commentReactions.type, 'like')
					)
				);

			// If a reaction exists, delete it (toggle off the like)
			if (existingCommentReactions) {
				const [deletedLikedComment] = await db
					.delete(commentReactions)
					.where(
						and(
							eq(commentReactions.userId, userId),
							eq(commentReactions.commentId, commentId)
						)
					)
					.returning();
				return deletedLikedComment;
			}

			// Insert a new "like" reaction
			const [createdCommentLikedReaction] = await db
				.insert(commentReactions)
				.values({ userId, commentId, type: 'like' })
				.onConflictDoUpdate({
					target: [commentReactions.userId, commentReactions.commentId],
					set: {
						type: 'like',
					},
				})
				.returning();

			return createdCommentLikedReaction ?? { commentId, userId, type: 'like' };
		}),

	dislike: protectedProcedure
		.input(z.object({ commentId: z.string().uuid() }))
		.mutation(async ({ input, ctx }) => {
			const { commentId } = input;
			const { id: userId } = ctx.user;

			// Check if a reaction already exists
			const [existingCommentReaction] = await db
				.select()
				.from(commentReactions)
				.where(
					and(
						eq(commentReactions.userId, userId),
						eq(commentReactions.commentId, commentId),
						eq(commentReactions.type, 'dislike')
					)
				);

			// If a reaction exists, delete it (toggle off the like)
			if (existingCommentReaction) {
				const [deletedislikedComment] = await db
					.delete(commentReactions)
					.where(
						and(
							eq(commentReactions.userId, userId),
							eq(commentReactions.commentId, commentId)
						)
					)
					.returning();
				return deletedislikedComment;
			}

			// Insert a new "like" reaction
			const [createdCommentDislikedReaction] = await db
				.insert(commentReactions)
				.values({ userId, commentId, type: 'dislike' })
				.onConflictDoUpdate({
					target: [commentReactions.userId, commentReactions.commentId],
					set: {
						type: 'dislike',
					},
				})
				.returning();

			return (
				createdCommentDislikedReaction ?? { commentId, userId, type: 'dislike' }
			);
		}),
});
