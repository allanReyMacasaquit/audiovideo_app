import { db } from '@/db';
import { videos } from '@/db/schema';
import { protectedProcedure, createTRPCRouter } from '@/trpc/init';
import { z } from 'zod';
import { desc, eq, or, and, lt } from 'drizzle-orm';

export const studioRouter = createTRPCRouter({
	getMany: protectedProcedure
		.input(
			z.object({
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
		.query(async ({ ctx, input }) => {
			const { limit, cursor } = input;
			const { id: userId } = ctx.user;

			const data = await db
				.select()
				.from(videos)
				.where(
					and(
						eq(videos.userId, userId),
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
