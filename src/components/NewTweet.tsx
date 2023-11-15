import { useSession } from 'next-auth/react';
import { ProfileImage } from './ProfileImage';
import { useState } from 'react';
import ResizableTextArea from './ResizableTextArea';
import { api } from '@/utils/api';

export function NewTweet() {
  const [content, setContent] = useState('');
  const session = useSession();
  const trpcUtils = api.useUtils();
  const createTweet = api.tweet.create.useMutation({
    onSuccess: (newTweet) => {
      setContent('');

      trpcUtils.tweet.infiniteFeed.setInfiniteData({}, (oldData) => {
        if (!oldData?.pages?.[0]) return;
        const user = session.data?.user;
        if (!user) return;
        const newCacheTweet = {
          ...newTweet,
          likeCount: 0,
          isLiked: false,
          user: {
            id: user.id,
            name: user.name ?? null,
            image: user.image ?? null,
          },
        };
        return {
          ...oldData,
          pages: [
            {
              ...oldData.pages[0],
              tweets: [newCacheTweet, ...oldData.pages[0].tweets],
            },
            ...oldData.pages.slice(1),
          ],
        };
      });
    },
  });

  if (session.status !== 'authenticated') return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createTweet.mutate({ content });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex space-x-4 border-b border-gray-200 px-4 py-4"
    >
      <ProfileImage className="shrink-0" src={session.data.user.image} />
      <div className="flex flex-grow flex-col">
        <ResizableTextArea
          value={content}
          className="w-full resize-none text-lg focus:outline-none"
          placeholder="What's happening?!"
          onChange={(e) => setContent(e.target.value)}
        />
        <button className="w-fit self-end rounded-full bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600">
          Post
        </button>
      </div>
    </form>
  );
}
