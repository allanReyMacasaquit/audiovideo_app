import Mux from '@mux/mux-node';

if (!process.env.MUX_TOKEN_ID || !process.env.MUX_TOKEN_SECRET) {
	throw new Error(
		'MUX credentials are missing. Please set MUX_TOKEN_ID and MUX_TOKEN_SECRET in your environment variables.'
	);
}

export const muxClient = new Mux({
	tokenId: process.env.MUX_TOKEN_ID!,
	tokenSecret: process.env.MUX_TOKEN_SECRET!,
	webhookSecret: process.env.MUX_WEBHOOK_SECRET!,
});
