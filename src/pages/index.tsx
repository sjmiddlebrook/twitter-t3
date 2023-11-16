import { NewTweet } from '@/components/NewTweet';
import InfiniteFeed from '@/components/InfiniteFeed';
import { api } from '@/utils/api';
import { useSession } from 'next-auth/react';
import clsx from 'clsx';
import { useState } from 'react';

const Tabs = {
  Recent: 'Recent',
  Following: 'Following',
} as const;
type Tabs = (typeof Tabs)[keyof typeof Tabs];

function RecentTweets() {
  const allTweets = api.tweet.infiniteFeed.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const tweets = allTweets.data?.pages.flatMap((page) => page.tweets) ?? [];
  return (
    <InfiniteFeed
      tweets={tweets}
      isError={allTweets.isError}
      isLoading={allTweets.isLoading}
      hasMoreData={!!allTweets.hasNextPage}
      fetchNewPage={allTweets.fetchNextPage}
    />
  );
}

function FollowingTweets() {
  const allTweets = api.tweet.infiniteFeed.useInfiniteQuery(
    {
      onlyFollowing: true,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const tweets = allTweets.data?.pages.flatMap((page) => page.tweets) ?? [];
  return (
    <InfiniteFeed
      tweets={tweets}
      isError={allTweets.isError}
      isLoading={allTweets.isLoading}
      hasMoreData={!!allTweets.hasNextPage}
      fetchNewPage={allTweets.fetchNextPage}
    />
  );
}

function TweetsDisplay({ selectedTab }: { selectedTab: Tabs }) {
  if (selectedTab === Tabs.Recent) {
    return <RecentTweets />;
  } else {
    return <FollowingTweets />;
  }
}

export default function Home() {
  const [selectedTab, setSelectedTab] = useState<Tabs>(Tabs.Recent);
  const session = useSession();
  const isAuthenticated = session.status === 'authenticated';
  return (
    <>
      <header className="top sticky z-10 border-b bg-white pt-4">
        <h1 className="px-4 text-xl font-semibold">Home</h1>
        {isAuthenticated && (
          <div className="flex">
            {Object.values(Tabs).map((tab) => (
              <button
                onClick={() => setSelectedTab(tab)}
                className="flex-grow font-semibold hover:bg-gray-200 focus-visible:bg-gray-200"
                key={tab}
              >
                <span
                  className={clsx('inline-block border-b-4 pb-3 pt-4', {
                    ['border-blue-400 text-gray-800']: tab === selectedTab,
                    ['border-transparent text-gray-500']: tab !== selectedTab,
                  })}
                >
                  {tab}
                </span>
              </button>
            ))}
          </div>
        )}
      </header>
      <NewTweet />
      <TweetsDisplay selectedTab={selectedTab} />
    </>
  );
}
