import { trpc } from '@/trpc/client';
import { useClerk } from '@clerk/nextjs';
import { toast } from 'sonner';

interface UseSubscriptionProps {
	userId: string;
	isSubscribed: boolean;
	fromVideoId?: string; // Made optional for safety
}

export const useSubscription = ({
	userId,
	isSubscribed,
	fromVideoId,
}: UseSubscriptionProps) => {
	const clerk = useClerk();
	const utils = trpc.useUtils();

	const subscribe = trpc.subscriptions.create.useMutation({
		onSuccess: () => {
			if (fromVideoId) {
				utils.videos.getOne.invalidate({ id: fromVideoId });
			}

			// Invalidate subscriptions list (if applicable)
			utils.subscriptions.invalidate(); // Ensure UI updates properly

			toast.success('Subscribed');
		},
		onError: (error) => {
			toast.error('Something went wrong');
			if (error.data?.code === 'UNAUTHORIZED') {
				clerk.openSignUp();
			}
		},
	});

	const unsubscribe = trpc.subscriptions.remove.useMutation({
		onSuccess: () => {
			if (fromVideoId) {
				utils.videos.getOne.invalidate({ id: fromVideoId });
			}

			// Invalidate subscriptions list (if applicable)
			utils.subscriptions.invalidate(); // Ensure UI updates properly

			toast.success('Unsubscribed');
		},
		onError: (error) => {
			toast.error('Something went wrong');
			if (error.data?.code === 'UNAUTHORIZED') {
				clerk.openSignUp();
			}
		},
	});

	const isPending = subscribe.isPending || unsubscribe.isPending;

	const toggleSubscription = () => {
		if (isPending) return; // Prevent duplicate requests

		if (isSubscribed) {
			unsubscribe.mutate({ userId });
		} else {
			subscribe.mutate({ userId });
		}
	};

	return { toggleSubscription, isSubscribed, isPending };
};
