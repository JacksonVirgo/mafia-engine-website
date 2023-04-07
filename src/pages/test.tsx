import { Channel } from "@prisma/client";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { prisma } from "~/server/db";

type Context = {
    channel?: Channel;
};

export default function DefaultArchive(ctx: Context) {
    console.log(ctx);
    return (
        <>
            <Head>
                <title></title>
            </Head>
            <div>Test</div>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    const { id } = ctx.query;
    if (!id) return { props: {} as Context };

    const channel = await prisma.channel.findUnique({
        where: {
            channelId: id.toString(),
        },
        select: {
            channelId: true,
            name: true,
        },
    });

    return {
        props: {
            channel: channel || undefined,
        } as Context,
    };
};
