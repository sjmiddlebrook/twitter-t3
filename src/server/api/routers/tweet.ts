import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const tweetRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.tweet.create({
        data: {
          userId: ctx.session.user.id,
          content: input.content,
        },
      });
    }),
  infiniteFeed: publicProcedure.input(z.object({
    limit: z.number().optional(),
    cursor: z.object({
      id: z.string(),
      createdAt: z.date(),
    }).optional(),
  })).query(async ({ ctx, input: { limit = 10, cursor } }) => {
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
        ...tweet,
        likeCount: tweet._count.likes,
        isLiked: tweet.likes.length > 0,
      };
    });

    return { tweets, nextCursor };
  }),
});
