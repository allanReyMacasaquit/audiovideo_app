import { db } from '@/db';
import { users, videoReactions, videos, videoViews } from '@/db/schema';
import { createTRPCRouter, baseProcedure } from '@/trpc/init';
import { z } from 'zod';
import { desc, eq, or, and, lt, getTableColumns } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const suggestionsRouter = createTRPCRouter({
	getMany: baseProcedure
		.input(
			z.object({
				videoId: z.string().uuid(),
				limit: z.number().min(1).max(50).default(5),
				// Composite cursor including both the date and the video id
				cursor: z
					.object({
						updatedAt: z.string(), // Date as ISO string
						id: z.string().uuid(),
					})
					.nullable()
					.default(null),
			})
		)
		.query(async ({ input }) => {
			const { videoId, limit, cursor } = input;

			const [existingVideo] = await db
				.select()
				.from(videos)
				.where(eq(videos.id, videoId));

			if (!existingVideo) {
				throw new TRPCError({ code: 'NOT_FOUND' });
			}

			const data = await db
				.select({
					...getTableColumns(videos),
					user: users,
					viewCount: db.$count(videoViews, eq(videoViews.videoId, videoId)),
					likeCount: db.$count(
						videoReactions,
						and(
							eq(videoReactions.videoId, videoId),
							eq(videoReactions.type, 'like')
						)
					),
					dislikeCount: db.$count(
						videoReactions,
						and(
							eq(videoReactions.videoId, videoId),
							eq(videoReactions.type, 'dislike')
						)
					),
				})
				.from(videos)
				.innerJoin(users, eq(videos.userId, users.id))
				.where(
					and(
						existingVideo.categoryId
							? eq(videos.categoryId, existingVideo.categoryId)
							: undefined,
						cursor
							? or(
									// Videos updated before the cursor’s updatedAt
									lt(videos.updatedAt, new Date(cursor.updatedAt)),
									// If updatedAt is equal, then only videos with an id less than the cursor’s id
									and(
										eq(videos.updatedAt, new Date(cursor.updatedAt)),
										lt(videos.id, cursor.id)
									)
								)
							: undefined
					)
				)
				.orderBy(desc(videos.updatedAt), desc(videos.id))
				.limit(limit);

			const nextCursor =
				data.length > 0
					? {
							updatedAt: data[data.length - 1].updatedAt.toISOString(),
							id: data[data.length - 1].id,
						}
					: null;

			return {
				items: data,
				nextCursor,
			};
		}),
});
