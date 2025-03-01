import Together from 'together-ai';
import { db } from '@/db';
import { videos } from '@/db/schema';
import { serve } from '@upstash/workflow/nextjs';
import { and, eq } from 'drizzle-orm';
import { UTApi } from 'uploadthing/server';

export const THUMBNAIL_SYSTEM_PROMPT = `Your task is to generate a compelling thumbnail concept for a YouTube video based on its title and transcript.  
Please follow these guidelines:  
1) Create a visually engaging and attention-grabbing concept that encourages clicks.  
2) Highlight the most exciting, dramatic, or intriguing aspect of the video.  
3) Suggest key visual elements, such as colors, facial expressions, text overlays, and background imagery.  
4) Keep it concise (under 50 words) and avoid unnecessary details.  
5) Only return the thumbnail concept as plain text. Do not add quotes or any additional formatting.`;

// Ensure Together is correctly initialized
export const together = new Together({
	apiKey: process.env.TOGETHER_API_KEY,
	baseURL: 'https://api.together.xyz/v1',
});

interface InputType {
	userId: string;
	videoId: string;
	prompt: string;
}

export const { POST } = serve(async (context) => {
	const utapi = new UTApi();
	const input = context.requestPayload as InputType;
	const { videoId, userId, prompt } = input;

	// 1) Get the video record first
	const video = await context.run('get-video', async () => {
		const existingVideo = await db
			.select()
			.from(videos)
			.where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

		if (!existingVideo[0]) {
			throw new Error('Not Found');
		}
		return existingVideo[0];
	});

	// 2) Cleanup previous thumbnail
	await context.run('cleanup-thumbnail', async () => {
		if (video.thumbnailUrlkey) {
			await utapi.deleteFiles(video.thumbnailUrlkey);
			await db
				.update(videos)
				.set({ thumbnailUrlkey: null, thumbnailUrl: null })
				.where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
		}
	});

	let generatedThumbnail: string;

	try {
		// 3) Call Together AI API properly
		const response = await fetch(
			'https://api.together.xyz/v1/images/generations',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
				},
				body: JSON.stringify({
					prompt: prompt || THUMBNAIL_SYSTEM_PROMPT,
					model: 'black-forest-labs/FLUX.1-schnell',
					response_format: 'base64',
					width: 1792,
					height: 1024,
				}),
			}
		);

		if (!response.ok) {
			throw new Error(`Together AI API error: ${response.statusText}`);
		}

		const data = await response.json();

		if (!data || !data.data || !data.data[0]) {
			throw new Error('Image generation failed: No image data returned.');
		}

		generatedThumbnail = data.data[0].b64_json;
	} catch (error) {
		console.error('Error generating image:', error);
		throw new Error('Image generation failed');
	}

	// 4) Convert Base64 to Blob and upload to UploadThing
	const buffer = Buffer.from(generatedThumbnail, 'base64');
	const file = new File([buffer], 'thumbnail.jpg', { type: 'image/jpeg' });

	const uploadedThumbnail = await context.run('upload-thumbnail', async () => {
		const { data } = await utapi.uploadFiles(file);
		if (!data) throw new Error('Bad Request');
		return data;
	});

	// 5) Update the video record with the generated thumbnail image
	await context.run('update-video', async () => {
		await db
			.update(videos)
			.set({
				thumbnailUrlkey: uploadedThumbnail.key,
				thumbnailUrl: uploadedThumbnail.ufsUrl,
			})
			.where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
	});

	return {
		message: 'Successfully generated thumbnail',
		thumbnail: uploadedThumbnail.ufsUrl,
	};
});
