import {
    DiscordAccount,
    Channel as PrismaChannel,
    Message,
} from "@prisma/client";
import React, { useEffect, useState } from "react";
import { api } from "~/utils/api";
import MessageComp from "./Message";

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
type ChannelProps = {
    channelId?: string;
};
export default function Channel({ channelId }: ChannelProps) {
    const [channel, setChannel] = useState<PrismaChannel>();
    const [messages, setMessages] = useState<MessageData[]>([]);
    const pageData = api.archive.getChannel.useQuery({
        // channelId: id ? (id as string) : "",
        channelId: channelId,
        take: 25,
        skip: 0,
    });
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

    if (channelId === undefined)
        return (
            <div className="flex grow flex-col bg-discord-dark pl-4">
                Invalid Channel
            </div>
        );

    return (
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
    );
}
