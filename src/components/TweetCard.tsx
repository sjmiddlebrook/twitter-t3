import { Heart, MessageCircle, Repeat2, Share } from 'lucide-react';
import { ProfileImage } from './ProfileImage';
import { clsx } from 'clsx';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { api } from '@/utils/api';
import { useEffect, useState } from 'react';

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

/**
 * https://www.builder.io/blog/relative-time
 */
function getRelativeTimeString(date: Date): string {
  // Allow dates or times to be passed
  const timeMs = date.getTime();

  // Get the amount of seconds between the given date and now
  const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);

  // Array reprsenting one minute, hour, day, week, month, etc in seconds
  const cutoffs = [
    60,
    3600,
    86400,
    86400 * 7,
    86400 * 30,
    86400 * 365,
    Infinity,
  ];

  // Array equivalent to the above but in the string representation of the units
  const units: Intl.RelativeTimeFormatUnit[] = [
    'second',
    'minute',
    'hour',
    'day',
    'week',
    'month',
    'year',
  ];

  // Grab the ideal cutoff unit
  const unitIndex = cutoffs.findIndex(
    (cutoff) => cutoff > Math.abs(deltaSeconds)
  );

  // Get the divisor to divide from the seconds. E.g. if our unit is "day" our divisor
  // is one day in seconds, so we can divide our seconds by this to get the # of days
  let divisor = 1;
  let unit: Intl.RelativeTimeFormatUnit = 'second';
  if (unitIndex !== -1) {
    const divisorCutoff = cutoffs[unitIndex - 1];
    if (divisorCutoff) {
      divisor = divisorCutoff;
    }
    const cutoffUnit = units[unitIndex];
    if (cutoffUnit) {
      unit = cutoffUnit;
    }
  }

  // Intl.RelativeTimeFormat do its magic
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  return rtf.format(Math.floor(deltaSeconds / divisor), unit);
}

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

function useRelativeTime({
  date,
  updateIntervalSeconds = 0,
}: {
  date: Date;
  updateIntervalSeconds?: number;
}) {
  const [relativeTime, setRelativeTime] = useState<string>(() => {
    return getRelativeTimeString(date);
  });

  useEffect(() => {
    if (!updateIntervalSeconds) return;
    const deltaMs = Date.now() - date.getTime();
    const deltaHours = Math.round(deltaMs / (1000 * 60 * 60));
    if (deltaHours > 1) return;
    const interval = setInterval(() => {
      const relativeTime = getRelativeTimeString(date);
      setRelativeTime(relativeTime);
    }, updateIntervalSeconds * 1000);
    return () => clearInterval(interval);
  }, [date, updateIntervalSeconds]);

  return relativeTime;
}

export default function TweetCard({
  id,
  content,
  createdAt,
  likeCount,
  isLiked,
  user,
}: Props) {
  const relativeTime = useRelativeTime({ date: createdAt, updateIntervalSeconds: 5 });
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
              {relativeTime}
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
