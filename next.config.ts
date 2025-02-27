import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'image.mux.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'utfs.io',
			},
			{
				protocol: 'https',
				hostname: 'de9vg4hol0.ufs.sh',
			},
		],
	},
};

export default nextConfig;
