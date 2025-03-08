import { db } from '@/db';
import { comments, users } from '@/db/schema';
import {
	baseProcedure,
	createTRPCRouter,
	protectedProcedure,
} from '@/trpc/init';
import { eq, getTableColumns } from 'drizzle-orm';
import { z } from 'zod';

export const commentsRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				videoId: z.string().uuid(),
				value: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { videoId, value } = input;
			const userId = ctx.user.id;

			// Insert the comment and return the created record
			const [createdComment] = await db
				.insert(comments)
				.values({ videoId, userId, value })
				.returning(); // Drizzle ORM returning()

			return createdComment ?? { videoId, userId, value };
		}),

	getMany: baseProcedure
		.input(
			z.object({
				videoId: z.string().uuid(),
			})
		)
		.query(async ({ input }) => {
			const { videoId } = input;

			// Fetch all comments for the given videoId using Drizzle ORM
			const data = await db
				.select({
					...getTableColumns(comments),
					user: users,
				})
				.from(comments)
				.where(eq(comments.videoId, videoId))
				.innerJoin(users, eq(comments.userId, users.id));

			return data;
		}),
});
