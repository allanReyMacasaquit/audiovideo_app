import { db } from '@/db';
import {
	subscriptions,
	users,
	videoReactions,
	videos,
	videoUpdateSchema,
	videoViews,
} from '@/db/schema';
import { muxClient } from '@/lib/mux';
import { QStashClient } from '@/lib/qstash';
import {
	baseProcedure,
	createTRPCRouter,
	protectedProcedure,
} from '@/trpc/init';
import { TRPCError } from '@trpc/server';
import { and, eq, getTableColumns, inArray, isNotNull } from 'drizzle-orm';
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
	generateThumbnail: protectedProcedure
		.input(z.object({ id: z.string().uuid(), prompt: z.string().min(10) }))
		.mutation(async ({ ctx, input }) => {
			const { id: userId } = ctx.user;
			const { workflowRunId } = await QStashClient.trigger({
				url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/thumbnail`,
				body: { userId, videoId: input.id, prompt: input.prompt }, // Optional body
				retries: 3,
			});
			return workflowRunId;
		}),
	generateTitle: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const { id: userId } = ctx.user;
			const { workflowRunId } = await QStashClient.trigger({
				url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
				body: { userId, videoId: input.id }, // Optional body
				retries: 3,
			});
			return workflowRunId;
		}),
	generateDescription: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const { id: userId } = ctx.user;
			const { workflowRunId } = await QStashClient.trigger({
				url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/description`,
				body: { userId, videoId: input.id }, // Optional body
				retries: 3,
			});
			return workflowRunId;
		}),

	revalidate: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const { id: userId } = ctx.user;

			const [existingVideo] = await db
				.select()
				.from(videos)
				.where(and(eq(videos.id, input.id), eq(videos.userId, userId)));

			// Throw if video doesn't exist
			if (!existingVideo) {
				throw new TRPCError({ code: 'NOT_FOUND' });
			}

			if (!existingVideo.muxUploadId) {
				throw new TRPCError({ code: 'BAD_REQUEST' });
			}

			const muxVideoUploadsRetrieve = await muxClient.video.uploads.retrieve(
				existingVideo.muxUploadId
			);

			if (!muxVideoUploadsRetrieve.asset_id) {
				throw new TRPCError({ code: 'BAD_REQUEST' });
			}

			const muxVideoAssetsRetrieve = await muxClient.video.assets.retrieve(
				muxVideoUploadsRetrieve.asset_id
			);

			if (!muxVideoAssetsRetrieve) {
				throw new TRPCError({ code: 'BAD_REQUEST' });
			}

			const playbackId = muxVideoAssetsRetrieve.playback_ids?.[0]?.id || null;
			const assetId = muxVideoAssetsRetrieve.id;
			const duration = muxVideoAssetsRetrieve.duration
				? Math.round(muxVideoAssetsRetrieve.duration * 1000)
				: 0;

			// Update the video record with fetched data
			const [updatedVideo] = await db
				.update(videos)
				.set({
					muxStatus: muxVideoAssetsRetrieve.status,
					muxPlaybackId: playbackId,
					muxAssetId: assetId,
					duration: duration,
				})
				.where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
				.returning();

			return updatedVideo;
		}),

	//----------for Video Page----------//
	getOne: baseProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ input, ctx }) => {
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
						videoId: videoReactions.videoId,
						type: videoReactions.type,
					})
					.from(videoReactions)
					.where(inArray(videoReactions.userId, userId ? [userId] : []))
			);

			const viewerSubscriptions = db.$with('viewer_subscriptions').as(
				db
					.select()
					.from(subscriptions)
					.where(inArray(subscriptions.viewerId, userId ? [userId] : []))
			);

			const [existingVideo] = await db
				.with(viewerReactions, viewerSubscriptions)
				.select({
					...getTableColumns(videos),
					user: {
						...getTableColumns(users),
						subscriberCount: db.$count(
							subscriptions,
							eq(subscriptions.creatorId, users.id)
						),
						viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(
							Boolean
						),
					},
					// subquery //
					viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
					likeCount: db.$count(
						videoReactions,
						and(
							eq(videoReactions.videoId, videos.id),
							eq(videoReactions.type, 'like')
						)
					),
					dislikeCount: db.$count(
						videoReactions,
						and(
							eq(videoReactions.videoId, videos.id),
							eq(videoReactions.type, 'dislike')
						)
					),
					viewerReactions: viewerReactions.type,
				})
				.from(videos)
				.innerJoin(users, eq(videos.userId, users.id))
				.leftJoin(viewerReactions, eq(viewerReactions.videoId, videos.id))
				.leftJoin(
					viewerSubscriptions,
					eq(viewerSubscriptions.creatorId, users.id)
				)
				.where(eq(videos.id, input.id));
			// .groupBy(videos.id, users.id, viewerReactions.videoId);

			if (!existingVideo) throw new TRPCError({ code: 'NOT_FOUND' });

			return existingVideo;
		}),
});
