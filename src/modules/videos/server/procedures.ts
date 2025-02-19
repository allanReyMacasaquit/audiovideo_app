import { db } from '@/db';
import { videos } from '@/db/schema';
import { muxClient } from '@/lib/mux';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';

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
});
