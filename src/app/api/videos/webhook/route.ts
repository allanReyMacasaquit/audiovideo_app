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
} from '@mux/mux-node/resources/webhooks';
import { db } from '@/db';

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET!;

type WebhookEvent =
	| VideoAssetCreatedWebhookEvent
	| VideoAssetReadyWebhookEvent
	| VideoAssetErroredWebhookEvent
	| VideoAssetTrackReadyWebhookEvent;

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

				await db
					.update(videos)
					.set({ muxStatus: data.status })
					.where(eq(videos.muxAssetId, data.id));

				console.log('Asset Ready:', data);
				break;
			}

			case 'video.asset.errored': {
				const data = payload.data as VideoAssetErroredWebhookEvent['data'];
				console.error('Asset Errored:', data);

				await db
					.update(videos)
					.set({ muxStatus: data.status })
					.where(eq(videos.muxAssetId, data.id));
				break;
			}

			case 'video.asset.track.ready': {
				const data = payload.data as VideoAssetTrackReadyWebhookEvent['data'];
				console.log('Track Ready:', data);

				// Example: handle track readiness (subtitles, etc.)
				// await db.update(videoTracks)...
				break;
			}

			default:
				console.log('Unhandled event type:', payload.type);
		}

		return NextResponse.json({ success: true }, { status: 200 });
	} catch (error) {
		console.error('Webhook verification error:', error);
		return new NextResponse('Invalid signature', { status: 400 });
	}
}
