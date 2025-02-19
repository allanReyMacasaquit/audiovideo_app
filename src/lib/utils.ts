import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatDuration = (duration: number) => {
	const seconds = Math.floor((duration % 60000) / 1000); // remainder in ms -> seconds
	const minutes = Math.floor(duration / 60000); // total ms -> minutes

	// Return in "mm:ss" format, padding with '0' if needed
	return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const snakeCaseToTitle = (str: string): string => {
	return str
		.replace(/_/g, ' ') // replace underscores with spaces
		.replace(/\b\w/g, (char) => char.toUpperCase()); // capitalize first letter of each word
};
