import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const tweetRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input: { content }, ctx }) => {
      return await ctx.prisma.tweet.create({ 
        data: { content, userId: ctx.session.user.id },
      })
    }
  ),
  infiniteFeed: publicProcedure
    .input(z.object({ 
      limit: z.number().optional(), 
      cursor: z.object({ id: z.string(), createdAt: z.date()}).optional(),
    })).query(async ({ input: { limit=10, cursor }, ctx }) => {
      const currentUserId = ctx.session?.user.id

      const data = await ctx.prisma.tweet.findMany({
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          content: true,
          createdAt: true,
          _count: { select: { likes: true } },
          likes: currentUserId == null ? false : {
            where: { 
              userId: currentUserId 
            },
          },
          user: {
            select: { name: true, id: true, image: true },
          }
        }
      })

      let nextCursor: typeof cursor | undefined
      
      if (data.length > limit) {
        const nextItem = data.pop()
        if (nextItem != null) {
          nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt }
        }
      }

      return { 
        tweets: data.map(tweet => ({
          ...tweet,
          likeCount: tweet._count.likes,
          likedByMe: tweet.likes?.length > 0,
        })),
        nextCursor 
      }
    }),
    toggleLike: protectedProcedure.input(z.object({ id: z.string()}))
      .mutation(async ({ input: { id }, ctx }) => {
        const data = { tweetId: id, userId: ctx.session.user.id }
        const existingLike = await ctx.prisma.like.findUnique({
          where: {  userId_tweetId: data }
        })

        if( existingLike == null ) {
          await ctx.prisma.like.create({ data })
          return { addedLike: true}
        } else {
          await ctx.prisma.like.delete({ where: { userId_tweetId: data } })
          return { addedLike: false }
        }
      }),
});
