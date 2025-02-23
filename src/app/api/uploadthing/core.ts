import { db } from '@/db';
import { users, videos } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError, UTApi } from 'uploadthing/server';
import { z } from 'zod';

const f = createUploadthing();

export const ourFileRouter = {
	thumbnailUploader: f({
		image: {
			maxFileSize: '4MB',
			maxFileCount: 1,
		},
	})
		.input(z.object({ videoId: z.string().uuid() }))
		.middleware(async ({ input }) => {
			const { userId: clerUserId } = await auth();

			if (!clerUserId) throw new UploadThingError('Unauthorized');

			const [user] = await db
				.select()
				.from(users)
				.where(eq(users.clerkId, clerUserId));

			if (!user) throw new UploadThingError('Not Found');

			const [existingVideo] = await db
				.select({
					thumbnailUrlkey: videos.thumbnailUrlkey,
				})
				.from(videos)
				.where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)));

			if (!existingVideo) throw new UploadThingError('Unauthorized');

			if (existingVideo.thumbnailUrlkey) {
				const utapi = new UTApi();

				await utapi.deleteFiles(existingVideo.thumbnailUrlkey);
				await db
					.update(videos)
					.set({ thumbnailUrlkey: null, thumbnailUrl: null })
					.where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)));
			}

			return { user, ...input };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			// This code RUNS ON YOUR SERVER after upload
			console.log('Upload complete for userId:', metadata.user.id);
			await db
				.update(videos)
				.set({ thumbnailUrl: file.ufsUrl, thumbnailUrlkey: file.key })
				.where(
					and(
						eq(videos.id, metadata.videoId),
						eq(videos.userId, metadata.user.id)
					)
				);

			console.log('file url', file.ufsUrl);

			// !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
			return { uploadedBy: metadata.user.id };
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
