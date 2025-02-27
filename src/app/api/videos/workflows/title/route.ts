import Together from 'together-ai';
import { db } from '@/db';
import { videos } from '@/db/schema';
import { serve } from '@upstash/workflow/nextjs';
import { and, eq } from 'drizzle-orm';

const TITLE_SYSTEM_PROMPT = `Your task is to generate an SEO-focused title for a YouTube video based on its transcript. 
Please follow these guidelines:
Be concise but descriptive, using relevant keywords to improve discoverability.
Highlight the most compelling or unique aspect of the video content.
Avoid jargon or overly complex language unless it directly supports searchability.
Use action-oriented phrasing or clear value propositions where applicable.
Ensure the title is 3–8 words long and no more than 100 characters.
Only return the title as plain text. Do not add quotes or any additional formatting.`;

const together = new Together();

interface InputType {
	userId: string;
	videoId: string;
}

export const { POST } = serve(async (context) => {
	const input = context.requestPayload as InputType;
	const { videoId, userId } = input;

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

	// 2) Use the video’s Mux info to fetch the transcript
	const transcript = await context.run('get-transcript', async () => {
		const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
		const response = await fetch(trackUrl);
		// 3) Make sure to await response.text()
		const text = await response.text();

		if (!text) {
			throw new Error('Bad Request: transcript is empty');
		}
		return text;
	});

	// 4) Call Together‑AI for chat completion
	const { choices } = await together.chat.completions.create({
		model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
		messages: [
			{ role: 'system', content: TITLE_SYSTEM_PROMPT },
			{ role: 'user', content: transcript },
		],
		stream: false, // or true if you need streaming
	});

	const title = choices?.[0]?.message?.content;
	if (!title) {
		throw new Error('Bad Request: No title returned from Together‑AI');
	}

	// 5) Update the video record with the generated title
	await context.run('update-video', async () => {
		await db
			.update(videos)
			.set({ title })
			.where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
	});

	return {
		message: 'Successfully generated title',
		title,
	};
});
