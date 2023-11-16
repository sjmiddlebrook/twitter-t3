import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const profileRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({
      input: { id },
      ctx,
    }) => {
      const userId = ctx.session?.user.id;
      const profile = await ctx.db.user.findUnique({
        select: {
          id: true,
          name: true,
          image: true,
          followers: userId
            ? {
              where: {
                id: userId,
              },
            }
            : undefined,
          _count: {
            select: {
              followers: true,
              follows: true,
              tweets: true,
            },
          },
        },
        where: {
          id,
        },
      });
      if (!profile) return;
      return {
        name: profile.name,
        image: profile.image,
        followersCount: profile._count.followers,
        followsCount: profile._count.follows,
        tweetsCount: profile._count.tweets,
        isFollowing: !!profile.followers.length,
      };
    }),
  toggleFollow: protectedProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input: { userId } }) => {
      const currentUserId = ctx.session?.user.id;
      const existingFollow = await ctx.db.user.findFirst({
        where: {
          id: currentUserId,
          follows: {
            some: {
              id: userId,
            },
          },
        },
      });
      let isFollowing = false;
      if (!existingFollow) {
        await ctx.db.user.update({
          where: { id: userId },
          data: {
            followers: {
              connect: {
                id: currentUserId,
              },
            },
          },
        });
        isFollowing = true;
      } else {
        await ctx.db.user.update({
          where: { id: userId },
          data: {
            followers: {
              disconnect: {
                id: currentUserId,
              },
            },
          },
        });
      }

      // revalidation
      void ctx.revalidateSSG?.(`/profile/${userId}`)
      void ctx.revalidateSSG?.(`/profile/${currentUserId}`)

      return { isFollowing };
    }),
});
