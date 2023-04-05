import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Channel, DiscordAccount, Message } from "@prisma/client";
import MessageComp from "~/components/Message";

type MessageData = Message & {
    author: DiscordAccount;
};

// Bubble Sort. Earliest = first
function reorderMessages(msg: MessageData[]) {
    const len = msg.length;
    const array = msg;
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len; j++) {
            const jVal = array[j];
            const jValAdd = array[j + 1];

            if (jVal && jValAdd) {
                if (jVal.createdAt.getTime() < jValAdd.createdAt.getTime()) {
                    [array[j], array[j + 1]] = [jValAdd, jVal];
                }
            }
        }
    }

    return msg;
}

const ChannelArchive: NextPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const pageData = api.archive.getChannel.useQuery({
        // channelId: id ? (id as string) : "",
        channelId: "1082940469203435551",
        take: 25,
        skip: 0,
    });

    const { data: channels, isLoading: channelsLoading } =
        api.archive.getAllChannels.useQuery({
            take: 25,
            skip: 0,
        });

    const [channel, setChannel] = useState<Channel>();
    const [messages, setMessages] = useState<MessageData[]>([]);

    useEffect(() => {
        if (pageData.isFetched) {
            const channel = pageData.data?.channel;
            if (channel) {
                setChannel(channel);
                const ordered = reorderMessages(channel.messages);
                setMessages(ordered);
            }
        }
    }, [pageData]);
    return (
        <>
            <Head>
                <title>Discord Mafia Archives</title>
                <meta
                    name="description"
                    content="Archive of a specific channel (this is the same with all pages for now, will change)"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="flex h-screen flex-row bg-discord-dark bg-polygon p-8 text-white">
                <div className="w-96 bg-discord-darker">
                    {channelsLoading
                        ? "Loading..."
                        : channels?.map((v) => {
                              return (
                                  <div
                                      className="py-2 pl-2 text-base hover:cursor-pointer hover:bg-gray-600"
                                      key={v.channelId}
                                  >
                                      #{v.name}
                                  </div>
                              );
                          })}
                </div>
                <div className="flex grow flex-col bg-discord-dark pl-4">
                    <div className="border-b-2 border-b-black py-4">
                        #{channel?.name}
                    </div>
                    <div className="overflow-x-auto overflow-y-scroll ">
                        {messages.map((v) => {
                            return <MessageComp msg={v} key={v.messageId} />;
                        })}
                    </div>
                </div>
            </main>
        </>
    );
};

export default ChannelArchive;
