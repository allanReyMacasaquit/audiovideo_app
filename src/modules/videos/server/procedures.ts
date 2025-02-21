import { db } from '@/db';
import { videos, videoUpdateSchema } from '@/db/schema';
import { muxClient } from '@/lib/mux';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

export const videoRouter = createTRPCRouter({
	create: protectedProcedure.mutation(async ({ ctx }) => {
		const { id: userId } = ctx.user;

		const upload = await muxClient.video.uploads.create({
			cors_origin: '*', // In Production set to your URL
			new_asset_settings: {
				playback_policy: ['public'],
				input: [
					{
						generated_subtitles: [
							{
								language_code: 'en',
								name: 'English',
							},
						],
					},
				],
				passthrough: userId,
			},
		});

		const [video] = await db
			.insert(videos)
			.values({
				userId,
				title: 'Untitled',
				muxStatus: 'waiting',
				muxUploadId: upload.id,
			})
			.returning();

		return { video, url: upload.url };
	}),

	update: protectedProcedure
		.input(videoUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			const { id: userId } = ctx.user;

			if (!input.id) throw new TRPCError({ code: 'BAD_REQUEST' });

			const [udpdateVideo] = await db
				.update(videos)
				.set({
					title: input.title,
					description: input.description,
					categoryId: input.categoryId,
					visibility: input.visibility,
					updatedAt: new Date(),
				})
				.where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
				.returning();

			if (!udpdateVideo) throw new TRPCError({ code: 'NOT_FOUND' });
			return udpdateVideo;
		}),

	remove: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const { id: userId } = ctx.user;

			const [removeVideo] = await db
				.delete(videos)
				.where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
				.returning();

			if (!removeVideo) throw new TRPCError({ code: 'NOT_FOUND' });
			return removeVideo;
		}),
});
