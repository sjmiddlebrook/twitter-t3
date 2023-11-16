import { Heart, MessageCircle, Repeat2, Share } from 'lucide-react';
import { ProfileImage } from './ProfileImage';
import { clsx } from 'clsx';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { api } from '@/utils/api';

type Props = {
  id: string;
  content: string;
  createdAt: Date;
  likeCount: number;
  isLiked: boolean;
  user: {
    image: string | null;
    name: string | null;
    id: string;
  };
};

type LikeBtnProps = {
  isLiked: boolean;
  likeCount: number;
  tweetId: string;
};

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'short',
});

function LikeButton({ isLiked, likeCount, tweetId }: LikeBtnProps) {
  const session = useSession();
  const userId = session.data?.user.id;
  const trpcUtils = api.useUtils();
  const toggleLike = api.tweet.toggleLike.useMutation({
    onSuccess: ({ isLiked }) => {
      const updatedData: Parameters<
        typeof trpcUtils.tweet.infiniteFeed.setInfiniteData
      >[1] = (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => {
            return {
              ...page,
              tweets: page.tweets.map((tweet) => {
                if (tweet.id !== tweetId) return tweet;
                return {
                  ...tweet,
                  isLiked,
                  likeCount: isLiked
                    ? tweet.likeCount + 1
                    : tweet.likeCount - 1,
                };
              }),
            };
          }),
        };
      };
      trpcUtils.tweet.infiniteFeed.setInfiniteData({}, updatedData);
      trpcUtils.tweet.infiniteFeed.setInfiniteData(
        {
          onlyFollowing: true,
        },
        updatedData
      );
      if (userId) {
        trpcUtils.tweet.infiniteProfileFeed.setInfiniteData(
          {
            userId,
          },
          updatedData
        );
      }
    },
  });

  function handleToggleLike() {
    if (!userId) return;
    toggleLike.mutate({ tweetId });
  }

  return (
    <button
      disabled={!userId || toggleLike.isLoading}
      onClick={handleToggleLike}
      className={clsx(
        'flex cursor-pointer items-center space-x-2 rounded p-1 text-gray-500',
        {
          ['hover:text-gray-600']: !isLiked,
          ['hover:bg-red-50']: isLiked,
        }
      )}
    >
      <Heart
        className={clsx({
          ['hover:fill-gray-500 hover:text-gray-700']: !isLiked,
          ['fill-red-600 text-red-600']: isLiked,
        })}
        size={16}
      />
      <span className="text-sm">{likeCount}</span>
    </button>
  );
}

export default function TweetCard({
  id,
  content,
  createdAt,
  likeCount,
  isLiked,
  user,
}: Props) {
  return (
    <div className="relative mx-auto cursor-pointer border-b border-gray-200 bg-white p-4 hover:bg-gray-100">
      <Link
        href={`/tweet/${id}}`}
        className="absolute inset-0 z-10"
        aria-hidden="true"
      />
      <div className="flex w-full space-x-4">
        <ProfileImage src={user.image} />
        <div className="w-full">
          <div className="flex items-center space-x-2">
            <Link
              href={`/profiles/${user.id}`}
              className="relative z-20 font-semibold hover:text-blue-500"
            >
              {user.name}
            </Link>
            <div className="text-sm text-gray-500">@{user.name}</div>
            <span className="text-gray-500">·</span>
            <time
              dateTime={createdAt.toLocaleString()}
              className="text-sm text-gray-500"
            >
              {dateTimeFormatter.format(createdAt)}
            </time>
          </div>
          <p className="relative z-20 mt-1 whitespace-pre-wrap">{content}</p>
          <div className="relative z-20 mt-4 flex max-w-md items-center justify-between">
            <div className="cursor-pointer text-gray-500 hover:text-gray-600">
              <MessageCircle size={16} />
            </div>
            <div className="cursor-pointer text-gray-500 hover:text-gray-600">
              <Repeat2 size={16} />
            </div>
            <LikeButton isLiked={isLiked} likeCount={likeCount} tweetId={id} />
            <div className="cursor-pointer text-gray-500 hover:text-gray-600">
              <Share size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
