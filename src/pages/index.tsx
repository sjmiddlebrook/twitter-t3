import { NewTweet } from '@/components/NewTweet';
import InfiniteFeed from '@/components/InfiniteFeed';
import { api } from '@/utils/api';

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

export default function Home() {
  return (
    <>
      <header className="top sticky z-10 border-b bg-white py-4">
        <h1 className="px-4 text-xl font-semibold">Home</h1>
      </header>
      <NewTweet />
      <RecentTweets />
    </>
  );
}
