import { db } from '@/db';
import { videos, videoUpdateSchema } from '@/db/schema';
import { muxClient } from '@/lib/mux';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { TRPCError } from '@trpc/server';
import { and, eq } from 'drizzle-orm';
import { UTApi } from 'uploadthing/server';
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

	restoreThumbnail: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const { id: userId } = ctx.user;

			// Fetch the existing video
			const [existingVideo] = await db
				.select()
				.from(videos)
				.where(and(eq(videos.id, input.id), eq(videos.userId, userId)));

			if (existingVideo.thumbnailUrlkey) {
				const utapi = new UTApi();

				await utapi.deleteFiles(existingVideo.thumbnailUrlkey);
				await db
					.update(videos)
					.set({ thumbnailUrlkey: null, thumbnailUrl: null })
					.where(and(eq(videos.id, input.id), eq(videos.userId, userId)));
			}

			// Throw if video doesn't exist
			if (!existingVideo) {
				throw new TRPCError({ code: 'NOT_FOUND' });
			}

			// Optional: Ensure muxAssetId exists (in case it's null or missing)
			if (!existingVideo.muxPlaybackId) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'No muxAssetId found. Cannot restore thumbnail.',
				});
			}

			// Build the thumbnail URL
			// const tempThumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`;
			// For advanced usage (time, width, height), you can do:
			const tempThumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg?time=10&width=640&height=360`;
			const utapi = new UTApi();
			const [uploadedThumbnail] = await utapi.uploadFilesFromUrl([
				tempThumbnailUrl,
			]);

			if (!uploadedThumbnail.data) {
				throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
			}

			const { key: thumbnailUrlkey, ufsUrl: thumbnailUrl } =
				uploadedThumbnail.data;

			// Update the thumbnail in the DB
			const [updatedVideo] = await db
				.update(videos)
				.set({ thumbnailUrl, thumbnailUrlkey })
				.where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
				.returning();

			return updatedVideo;
		}),
});
