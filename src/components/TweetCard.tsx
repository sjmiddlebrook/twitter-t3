import { Heart, MessageCircle, Repeat2, Share } from 'lucide-react';
import { ProfileImage } from './ProfileImage';
import { clsx } from 'clsx';

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
      <a
        href={`/tweet/${id}}`}
        className="absolute inset-0 z-10"
        aria-hidden="true"
        tabIndex={-1}
      />
      <div className="flex w-full space-x-4">
        <ProfileImage src={user.image} />
        <div className="w-full">
          <a
            href={`/profile/${user.id}`}
            className="relative z-20 font-semibold hover:text-blue-500"
          >
            {user.name}
          </a>
          <div className="text-sm text-gray-500">@{user.name}</div>
          <p className="relative z-20 mt-1">{content}</p>
          <div className="relative z-20 mt-4 flex max-w-md items-center justify-between">
            <div className="cursor-pointer text-gray-400 hover:text-gray-600">
              <MessageCircle size={16} />
            </div>
            <div className="cursor-pointer text-gray-400 hover:text-gray-600">
              <Repeat2 size={16} />
            </div>
            <div
              className={clsx(
                'flex cursor-pointer items-center space-x-2 rounded p-1 text-gray-600',
                {
                  ['text-gray-400 hover:text-gray-600']: !isLiked,
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
            </div>
            <div className="cursor-pointer text-gray-400 hover:text-gray-600">
              <Share size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
