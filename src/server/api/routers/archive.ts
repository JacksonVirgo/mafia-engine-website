import { z } from "zod";

import {
    createTRPCRouter,
    publicProcedure,
    // privateProcedure,
} from "~/server/api/trpc";

function extractMentionedUserId(mention: string): string | undefined {
    const regex = /<@(\S+)>/;
    const match = mention.match(regex);
    return match ? match[1] : undefined;
}

export const archiveRouter = createTRPCRouter({
    getChannel: publicProcedure
        .input(
            z.object({
                channelId: z.string().nullish(),
                take: z.number().nullish(),
                skip: z.number().nullish(),
            })
        )
        .query(async ({ ctx, input }) => {
            const { channelId, take, skip } = input;
            if (!channelId)
                return { channel: null, error: "Does not have ChannelID" };

            const takeAmount = take || 25;
            const skipAmount = skip || 0;

            try {
                const data = await ctx.prisma.channel.findUnique({
                    where: {
                        channelId: channelId,
                    },
                    include: {
                        messages: {
                            take: takeAmount,
                            skip: skipAmount,
                            include: {
                                author: true,
                            },
                        },
                    },
                });

                if (!data)
                    return {
                        channel: null,
                        error: "Channel does not exist",
                    };

                return {
                    channel: data,
                    error: null,
                };
            } catch (err) {
                console.log(err);
                return { channel: null, error: "Unexpected error" };
            }
        }),

    getUser: publicProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ ctx, input }) => {
            const extract = extractMentionedUserId(input.userId);

            try {
                if (!extract) throw Error();
                const user = await ctx.prisma.discordAccount.findFirst({
                    where: {
                        discordId: extract,
                    },
                });

                if (!user)
                    return {
                        user: null,
                        status: 404,
                        input: input.userId,
                        formatted: extract,
                    };
                return {
                    user,
                    status: 200,
                    input: input.userId,
                    formatted: extract,
                };
            } catch (err) {
                return {
                    user: null,
                    status: 500,
                    input: input.userId,
                    formatted: extract,
                };
            }
        }),

    getAllChannels: publicProcedure
        .input(
            z.object({
                take: z.number().nullish(),
                skip: z.number().nullish(),
            })
        )
        .query(async ({ ctx, input }) => {
            const takeAmount = input.take || 25;
            const skipAmount = input.skip || 0;
            const data = await ctx.prisma.channel.findMany({
                take: takeAmount,
                skip: skipAmount,
                select: {
                    name: true,
                    channelId: true,
                },
            });

            return data;
        }),
});
