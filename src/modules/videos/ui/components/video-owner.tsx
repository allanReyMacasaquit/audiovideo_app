import { UserAvatar } from '@/components/user-avatar';
import { VideoGetOneOutputType } from '../type';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Edit, User } from 'lucide-react';
import { SubscriptionButton } from '@/modules/subscriptions/ui/components/subscription-button';
import UserInfo from '@/modules/users/ui/components/user-info';
import { VideoMenu } from './video-menu';

interface VideoOwnerProps {
	user: VideoGetOneOutputType['user'];
	video: VideoGetOneOutputType;
	videoId: string;
}

const VideoOwner = ({ user, videoId, video }: VideoOwnerProps) => {
	const { userId: clerkUserId } = useAuth();

	return (
		<div className='flex items-center justify-between gap-3 min-w-0'>
			{/* Left Section: User Info */}
			<div className='flex items-center gap-3 min-w-0'>
				<Link
					href={`/users/${user.id}`}
					className='flex items-center gap-3 min-w-0'
				>
					<UserAvatar
						size='default'
						imageUrl={user.imageUrl}
						name={user.name}
					/>
					<div className=''>
						<UserInfo
							name={user.name}
							tooltip={user.name}
							icon={<User className='mr-2' />}
							size='default'
						/>
						<span className='text-sm text-muted-foreground line-clamp-1'>
							{/* Todo: subscribers count */}0 subscriber/s
						</span>
					</div>
				</Link>
				{/* Subscription Button (Only visible for other users) */}
				{clerkUserId !== user.clerkId && (
					<SubscriptionButton
						className=''
						disabled={false}
						isSubscribed={false}
						onClick={() => {}}
						size='default'
					/>
				)}
			</div>
			<div className=' flex gap-x-2'>
				{/* Right Section: Edit Video Button */}
				{clerkUserId === user.clerkId && (
					<Button className='rounded-full' asChild variant='default'>
						<Link href={`/studio/videos/${videoId}`}>
							<Edit className='h-4 w-4 mr-2' /> Edit Video
						</Link>
					</Button>
				)}

				<VideoMenu videoId={video.id} />
			</div>
		</div>
	);
};

export default VideoOwner;
