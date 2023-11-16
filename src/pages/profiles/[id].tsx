import { ssgHelper } from '@/server/api/ssgHelper';
import { api } from '@/utils/api';
import type {
  GetStaticPaths,
  GetStaticPropsContext,
  InferGetStaticPropsType,
  NextPage,
} from 'next';
import Head from 'next/head';
import ErrorPage from 'next/error';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProfileImage } from '@/components/ProfileImage';
import React from 'react';
import clsx from 'clsx';
import InfiniteFeed from '@/components/InfiniteFeed';
import { useSession } from 'next-auth/react';

const pluralRules = new Intl.PluralRules();
function getPlural({
  number,
  singular,
  plural,
}: {
  number: number;
  singular: string;
  plural: string;
}) {
  return pluralRules.select(number) === 'one' ? singular : plural;
}

interface FollowBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isFollowing: boolean;
  userId: string;
}

function FollowButton({ isFollowing, userId }: FollowBtnProps) {
  const session = useSession();
  if (session.status !== 'authenticated') return null;
  if (session.data.user.id === userId) return null;
  const trpcUtils = api.useUtils();
  const toggleFollow = api.profile.toggleFollow.useMutation({
    onSuccess: ({ isFollowing }) => {
      trpcUtils.profile.getById.setData({ id: userId }, (oldData) => {
        if (!oldData) return oldData;
        const countModifier = isFollowing ? 1 : -1;
        return {
          ...oldData,
          isFollowing,
          followersCount: oldData.followersCount + countModifier,
        };
      });
    },
  });

  function handleClick() {
    toggleFollow.mutate({ userId });
  }

  return (
    <button
      disabled={toggleFollow.isLoading}
      onClick={handleClick}
      className={clsx('h-fit rounded-full border px-4 py-2 font-semibold', {
        ['bg-gray-900 text-white hover:bg-gray-950']: isFollowing,
        ['bg-white text-gray-900 hover:bg-gray-900 hover:text-white']:
          !isFollowing,
      })}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}

const ProfilePage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  id,
}) => {
  const { data: user } = api.profile.getById.useQuery({ id });
  const allTweets = api.tweet.infiniteProfileFeed.useInfiniteQuery(
    {
      userId: id,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const tweets = allTweets.data?.pages.flatMap((page) => page.tweets) ?? [];
  if (!user) return <ErrorPage statusCode={404} />;
  return (
    <>
      <Head>
        <title>{`T3 | ${user.name}`}</title>
      </Head>
      <header className="sticky top-0 z-30 flex items-center space-x-6 border-b bg-white bg-opacity-95 p-4">
        <Link href="..">
          <ArrowLeft size={24} />
        </Link>
        <ProfileImage src={user.image} className="flex-shrink-0" />
        <div className="ml-2 flex flex-grow items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">{user.name}</h1>
            <div className="text-sm text-gray-500">
              {user.tweetsCount}
              {` `}
              {getPlural({
                number: user.tweetsCount,
                singular: 'Post',
                plural: 'Posts',
              })}
            </div>
          </div>
          <FollowButton userId={id} isFollowing={user.isFollowing} />
        </div>
      </header>
      <main>
        <InfiniteFeed
          tweets={tweets}
          isError={allTweets.isError}
          isLoading={allTweets.isLoading}
          hasMoreData={!!allTweets.hasNextPage}
          fetchNewPage={allTweets.fetchNextPage}
        />
      </main>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export async function getStaticProps(
  context: GetStaticPropsContext<{ id: string }>
) {
  const id = context.params?.id;

  if (!id)
    return {
      redirect: {
        destination: '/',
      },
    };
  const ssg = ssgHelper();
  await ssg.profile.getById.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
}

export default ProfilePage;
