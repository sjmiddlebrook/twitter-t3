import { z } from "zod";

import {
  type createTRPCContext,
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { type Prisma } from "@prisma/client";
import { type inferAsyncReturnType } from "@trpc/server";

export const tweetRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ content: z.string().min(1) }))
    .mutation(async ({ ctx, input: { content } }) => {
      const userId = ctx.session.user.id;
      const tweet = await ctx.db.tweet.create({
        data: {
          userId,
          content,
        },
      });
      void ctx.revalidateSSG?.(`/profile/${userId}`)
      return tweet;
    }),
  toggleLike: protectedProcedure
    .input(z.object({ tweetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const data = {
        tweetId: input.tweetId,
        userId: ctx.session.user.id,
      };
      const tweetLike = await ctx.db.like.findUnique({
        where: {
          userId_tweetId: data,
        },
      });
      if (!tweetLike) {
        await ctx.db.like.create({
          data,
        });
        return { isLiked: true };
      } else {
        await ctx.db.like.delete({
          where: {
            userId_tweetId: data,
          },
        });
        return { isLiked: false };
      }
    }),
  infiniteFeed: publicProcedure
    .input(z.object({
      onlyFollowing: z.boolean().optional(),
      limit: z.number().optional(),
      cursor: z.object({
        id: z.string(),
        createdAt: z.date(),
      }).optional(),
    }))
    .query(
      async ({ ctx, input: { limit = 10, cursor, onlyFollowing = false } }) => {
        const userId = ctx.session?.user.id;
        let whereClause: Prisma.TweetWhereInput | undefined;
        if (userId && onlyFollowing) {
          whereClause = {
            user: {
              followers: {
                some: { id: userId },
              },
            },
          };
        }
        const tweets = await getInfiniteTweets({
          whereClause,
          limit,
          cursor,
          ctx,
        });
        return tweets;
      },
    ),
  infiniteProfileFeed: publicProcedure
    .input(z.object({
      userId: z.string(),
      limit: z.number().optional(),
      cursor: z.object({
        id: z.string(),
        createdAt: z.date(),
      }).optional(),
    }))
    .query(
      async ({ ctx, input: { limit = 10, cursor, userId } }) => {
        const tweets = await getInfiniteTweets({
          whereClause: {
            userId,
          },
          limit,
          cursor,
          ctx,
        });
        return tweets;
      },
    ),
});

async function getInfiniteTweets({
  whereClause,
  limit,
  cursor,
  ctx,
}: {
  whereClause?: Prisma.TweetWhereInput;
  limit: number;
  cursor?: { id: string; createdAt: Date };
  ctx: inferAsyncReturnType<typeof createTRPCContext>;
}) {
  const currentUserId = ctx.session?.user.id;

  const data = await ctx.db.tweet.findMany({
    select: {
      id: true,
      content: true,
      createdAt: true,
      _count: { select: { likes: true } },
      likes: currentUserId
        ? {
          where: {
            userId: currentUserId,
          },
        }
        : false,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    where: whereClause,
    take: limit + 1,
    cursor: cursor ? { createdAt_id: cursor } : undefined,
    orderBy: [
      { createdAt: "desc" },
      { id: "desc" },
    ],
  });

  let nextCursor: typeof cursor | undefined;
  if (data.length > limit) {
    const lastTweet = data.pop();
    if (lastTweet) {
      nextCursor = {
        id: lastTweet.id,
        createdAt: lastTweet.createdAt,
      };
    }
  }

  const tweets = data.map((tweet) => {
    return {
      id: tweet.id,
      content: tweet.content,
      user: tweet.user,
      createdAt: tweet.createdAt,
      likeCount: tweet._count.likes,
      isLiked: tweet.likes?.length > 0,
    };
  });

  return { tweets, nextCursor };
}
