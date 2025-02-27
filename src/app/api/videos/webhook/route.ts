import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { videos } from '@/db/schema';

import { muxClient } from '@/lib/mux';
import {
	VideoAssetCreatedWebhookEvent,
	VideoAssetErroredWebhookEvent,
	VideoAssetReadyWebhookEvent,
	VideoAssetTrackReadyWebhookEvent,
	VideoAssetDeletedWebhookEvent,
} from '@mux/mux-node/resources/webhooks';
import { db } from '@/db';
import { UTApi } from 'uploadthing/server';

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET!;

type WebhookEvent =
	| VideoAssetCreatedWebhookEvent
	| VideoAssetReadyWebhookEvent
	| VideoAssetErroredWebhookEvent
	| VideoAssetTrackReadyWebhookEvent
	| VideoAssetDeletedWebhookEvent;

export async function POST(req: Request) {
	// 1. Make sure MUX_WEBHOOK_SECRET is defined
	if (!SIGNING_SECRET) {
		return new NextResponse('No MUX_WEBHOOK_SECRET found', { status: 401 });
	}

	try {
		// 2. Retrieve the signature from headers
		const headersPayload = await headers();
		const muxSignature = headersPayload.get('mux-signature');
		if (!muxSignature) {
			return new NextResponse('No Signature found', { status: 401 });
		}

		// 3. Read and stringify the raw JSON body
		const payload = await req.json();
		const body = JSON.stringify(payload);

		// 4. Verify the signature (throws if invalid)
		muxClient.webhooks.verifySignature(
			body,
			{ 'mux-signature': muxSignature },
			SIGNING_SECRET
		);

		// 5. Cast the payload to our strongly typed WebhookEvent

		// 6. Handle each event type with a switch
		switch (payload.type as WebhookEvent['type']) {
			case 'video.asset.created': {
				const data = payload.data as VideoAssetCreatedWebhookEvent['data'];
				if (!data.upload_id) {
					return new NextResponse('No upload ID found', { status: 400 });
				}

				await db
					.update(videos)
					.set({
						muxAssetId: data.id,
						muxStatus: data.status,
					})
					.where(eq(videos.muxUploadId, data.upload_id));
				break;
			}

			case 'video.asset.ready': {
				const data = payload.data as VideoAssetReadyWebhookEvent['data'];
				const playbackId = data.playback_ids?.[0].id;
				const duration = data.duration ? Math.round(data.duration * 10000) : 0;

				if (!playbackId)
					return new Response('Missing Playback Id', { status: 400 });

				const tempThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
				const tempPreviewUrl = `https://image.mux.com/${playbackId}/animated.gif`;

				const utapi = new UTApi();
				const [uploadedThumbnail, uploadedPreview] =
					await utapi.uploadFilesFromUrl([tempThumbnailUrl, tempPreviewUrl]);

				if (!uploadedThumbnail.data || !uploadedPreview.data) {
					return new Response('Failed to upload Thumbnail or Preview', {
						status: 500,
					});
				}

				const { key: thumbnailUrlkey, url: thumbnailUrl } =
					uploadedThumbnail.data;
				const { key: previewUrlkey, url: previewUrl } = uploadedPreview.data;

				await db
					.update(videos)
					.set({
						muxStatus: data.status,
						muxPlaybackId: playbackId,
						muxAssetId: data.id,
						thumbnailUrl,
						previewUrl,
						thumbnailUrlkey,
						previewUrlkey,
						duration,
					})
					.where(eq(videos.muxAssetId, data.id));
				break;
			}

			case 'video.asset.errored': {
				const data = payload.data as VideoAssetErroredWebhookEvent['data'];
				if (!data.upload_id) {
					return new NextResponse('No upload ID found', { status: 400 });
				}

				await db
					.update(videos)
					.set({ muxStatus: data.status })
					.where(eq(videos.muxAssetId, data.id));
				break;
			}

			case 'video.asset.deleted': {
				const data = payload.data as VideoAssetDeletedWebhookEvent['data'];
				if (!data.upload_id) {
					return new NextResponse('No upload ID found', { status: 400 });
				}

				await db.delete(videos).where(eq(videos.muxAssetId, data.id));
				break;
			}

			case 'video.asset.track.ready': {
				const data =
					payload.data as VideoAssetTrackReadyWebhookEvent['data'] & {
						asset_id?: string;
					};

				const assetId = data.asset_id; // Use the asset_id from the payload
				const muxTrackId = data.id; // This is the track ID
				const muxTrackStatus = data.status;

				if (!assetId) {
					return new NextResponse('Missing Mux asset ID', { status: 400 });
				}

				await db
					.update(videos)
					.set({
						muxTrackStatus: muxTrackStatus,
						muxTrackId: muxTrackId,
					})
					.where(eq(videos.muxAssetId, assetId));
				break;
			}

			default:
				console.log('event type:', payload.type);
		}

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error) {
		console.error('Webhook verification error:', error);
		return new NextResponse('Invalid signature', { status: 400 });
	}
}
