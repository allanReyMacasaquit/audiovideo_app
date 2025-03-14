// Import logical operators, comparison functions, and a helper to retrieve all table columns from drizzle-orm.
import {
	and,
	eq,
	lt,
	desc,
	or,
	getTableColumns,
	count,
	inArray,
	isNotNull,
	isNull,
} from 'drizzle-orm';

// Import the database instance from the project’s database configuration.
import { db } from '@/db';

// Import the schema definitions for the comments and users tables.
import { commentReactions, comments, users } from '@/db/schema';

// Import procedure helpers and router creator for TRPC, including:
// - baseProcedure: a base for building procedures,
// - createTRPCRouter: function to create a TRPC router,
// - protectedProcedure: for endpoints that require authentication.
import {
	baseProcedure,
	createTRPCRouter,
	protectedProcedure,
} from '@/trpc/init';

// Import zod library for input validation and schema definition.
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

// Create a TRPC router specifically for comment-related operations.
export const commentsRouter = createTRPCRouter({
	// Define a protected mutation endpoint for creating a new comment.
	create: protectedProcedure
		.input(
			z.object({
				parentId: z.string().uuid().nullish(),
				videoId: z.string().uuid(),
				value: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { parentId, videoId, value } = input;
			const userId = ctx.user.id;

			const [existingComment] = await db
				.select()
				.from(comments)
				.where(inArray(comments.id, parentId ? [parentId] : []));

			if (!existingComment && parentId) {
				throw new TRPCError({ code: 'NOT_FOUND' });
			}

			if (existingComment?.parentId && parentId) {
				throw new TRPCError({ code: 'BAD_REQUEST' });
			}

			const [createdComment] = await db
				.insert(comments)
				.values({ parentId, videoId, userId, value })
				.returning();

			return createdComment ?? { parentId, videoId, userId, value };
		}),

	// Define a protected mutation endpoint for creating a new comment.
	remove: protectedProcedure
		.input(
			z.object({
				id: z.string().uuid(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { id } = input;
			const userId = ctx.user.id;

			const [deletedComment] = await db
				.delete(comments)
				.where(and(eq(comments.id, id), eq(comments.userId, userId)))
				.returning();

			if (!deletedComment) {
				throw new TRPCError({ code: 'NOT_FOUND' });
			}

			return deletedComment;
		}),

	// Define a query endpoint to retrieve multiple comments for a given video, along with the total count.
	getMany: baseProcedure
		.input(
			z.object({
				parentId: z.string().uuid().nullish(),
				videoId: z.string().uuid(),
				limit: z.number().min(1).max(50).default(5),
				// Composite cursor: includes createdAt (ISO string) and id.
				cursor: z
					.object({
						createdAt: z.string(),
						id: z.string().uuid(),
					})
					.nullable()
					.default(null),
			})
		)
		.query(async ({ input, ctx }) => {
			const { parentId, videoId, limit, cursor } = input;
			const { clerkUserId } = ctx;

			// ✅ Fix 1: Ensure `userId` is properly assigned
			const [user] = await db
				.select()
				.from(users)
				.where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));

			const userId = user?.id;

			const viewerReactions = db.$with('viewer_reactions').as(
				db
					.select({
						commentId: commentReactions.commentId,
						type: commentReactions.type,
					})
					.from(commentReactions)
					.where(inArray(commentReactions.userId, userId ? [userId] : []))
			);
			const replies = db.$with('replies').as(
				db
					.select({
						parentId: comments.parentId,
						count: count(comments.id).as('count'),
					})
					.from(comments)
					.where(isNotNull(comments.parentId))
					.groupBy(comments.parentId)
			);

			// Run two queries in parallel:
			// 1) A count of all comments for the specified videoId.
			// 2) A paginated list of comments for the specified videoId.
			const [totalCountResult, data] = await Promise.all([
				db
					.select({
						count: count(), // Aggregates COUNT(*) by default
					})
					.from(comments)
					.where(eq(comments.videoId, videoId)),

				db
					.with(viewerReactions, replies)
					.select({
						...getTableColumns(comments),
						user: users,
						viewerReaction: viewerReactions.type,
						replyCount: replies.count,
						likeCount: db.$count(
							commentReactions,
							and(
								eq(commentReactions.type, 'like'),
								eq(commentReactions.commentId, comments.id)
							)
						),
						dislikeCount: db.$count(
							commentReactions,
							and(
								eq(commentReactions.type, 'dislike'),
								eq(commentReactions.commentId, comments.id)
							)
						),
					})
					.from(comments)
					.innerJoin(users, eq(comments.userId, users.id))
					.leftJoin(viewerReactions, eq(comments.id, viewerReactions.commentId))
					.leftJoin(replies, eq(comments.id, replies.parentId))
					.where(
						and(
							eq(comments.videoId, videoId),
							parentId
								? eq(comments.parentId, parentId)
								: isNull(comments.parentId),
							cursor
								? or(
										// If there's a cursor, load only comments created before that cursor's date...
										lt(comments.createdAt, new Date(cursor.createdAt)),
										// ...or if the same createdAt, only those with an id less than the cursor’s id.
										and(
											eq(comments.createdAt, new Date(cursor.createdAt)),
											lt(comments.id, cursor.id)
										)
									)
								: undefined
						)
					)
					.orderBy(desc(comments.createdAt), desc(comments.id))
					.limit(limit),
			]);

			// totalCountResult is an array with one item containing { count: number }.
			const totalCount = totalCountResult[0]?.count ?? 0;

			// Determine the next cursor for pagination using the last comment in the returned data.
			const nextCursor =
				data.length > 0
					? {
							createdAt: data[data.length - 1].createdAt.toISOString(),
							id: data[data.length - 1].id,
						}
					: null;

			return {
				totalCount,
				items: data,
				nextCursor,
			};
		}),
});
