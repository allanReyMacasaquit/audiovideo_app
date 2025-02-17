import { db } from '@/db';
import { videos } from '@/db/schema';
import { protectedProcedure, createTRPCRouter } from '@/trpc/init';
import { z } from 'zod';
import { desc, eq, or, and, lt } from 'drizzle-orm'; // ✅ Use `lt` for filtering by cursor

export const studioRouter = createTRPCRouter({
	getMany: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(50).default(10),
				cursor: z.string().uuid().nullable().default(null), // Cursor for pagination
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
						eq(videos.userId, userId), // ✅ Only fetch user's videos
						cursor
							? or(
									lt(videos.updatedAt, new Date(cursor)), // ✅ Correct Date comparison
									and(
										eq(videos.updatedAt, new Date(cursor)),
										lt(videos.id, cursor)
									) // ✅ Compare ID properly
								)
							: undefined
					)
				)
				.orderBy(desc(videos.updatedAt), desc(videos.id)) // ✅ Ensuring stable sorting
				.limit(limit);

			const nextCursor =
				data.length > 0
					? data[data.length - 1].updatedAt.toISOString() // ✅ Convert Date to string
					: null;

			return {
				items: data,
				nextCursor,
			};
		}),
});
