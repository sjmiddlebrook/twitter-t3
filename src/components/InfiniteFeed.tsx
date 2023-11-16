import InfiniteScroll from 'react-infinite-scroll-component';
import TweetCard from './TweetCard';

type Tweet = {
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

type Props = {
  tweets: Tweet[];
  isError: boolean;
  isLoading: boolean;
  hasMoreData: boolean;
  fetchNewPage: () => Promise<unknown>;
};

export default function InfiniteFeed({
  tweets,
  isError,
  isLoading,
  hasMoreData,
  fetchNewPage,
}: Props) {
  if (isError) return <div className="pt-4 pl-4 text-lg">Something went wrong</div>;
  if (isLoading) return <div className="pt-4 pl-4 text-lg">Loading...</div>;
  if (!tweets.length) return <div className="pt-4 pl-4 text-lg">No tweets</div>;
  return (
    <ul className="flex flex-col space-y-4">
      <InfiniteScroll
        hasMore={hasMoreData}
        dataLength={tweets.length}
        next={fetchNewPage}
        loader={'Loading...'}
      >
        {tweets.map((tweet) => (
          <li key={tweet.id}>
            <TweetCard {...tweet} />
          </li>
        ))}
      </InfiniteScroll>
    </ul>
  );
}
