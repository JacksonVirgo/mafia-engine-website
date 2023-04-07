import {
    DiscordAccount,
    Channel as PrismaChannel,
    Message,
} from "@prisma/client";
import React, { useEffect, useState } from "react";
import { api } from "~/utils/api";
import MessageComp, { MessageSkeleton } from "./Message";

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

    const [isLoading, setIsLoading] = useState(true);

    const pageData = api.archive.getChannel.useQuery({
        // channelId: id ? (id as string) : "",
        channelId: channelId,
        take: 25,
        skip: 0,
    });
    useEffect(() => {
        if (pageData.isLoading) {
            setIsLoading(true);
        } else {
            setIsLoading(false);
            const channel = pageData.data?.channel;
            if (channel) {
                setChannel(channel);
                const ordered = reorderMessages(channel.messages);
                setMessages(ordered);
            }
        }
    }, [pageData]);

    useEffect(() => {
        console.log("RESET ALL");
    }, [channelId]);

    if (channelId === undefined)
        return (
            <div className="flex grow flex-col bg-discord-dark pl-4">
                Invalid Channel
            </div>
        );

    return (
        <div className="flex grow flex-col bg-discord-dark pl-4">
            {isLoading ? (
                <ChannelSkeleton />
            ) : (
                <ChannelHydrated channel={channel} messages={messages} />
            )}
        </div>
    );
}

type Hydration = {
    channel?: PrismaChannel;
    messages: MessageData[];
};
export function ChannelHydrated({ channel, messages }: Hydration) {
    return (
        <>
            <div className="border-b-2 border-b-black py-4">
                #{channel?.name}
            </div>
            <div className="overflow-x-auto overflow-y-scroll ">
                {messages.map((v) => {
                    return <MessageComp msg={v} key={v.messageId} />;
                })}
            </div>
        </>
    );
}

export function ChannelSkeleton() {
    /// create a function which returns X unique spans, where X is an arbitrary number. Removing all use of the any type
    const createSkeleton = (num: number) => {
        const arr = [];
        for (let i = 0; i < num; i++) {
            arr.push(<MessageSkeleton key={i} />);
        }
        return arr;
    };

    return (
        <>
            <div className="flex border-b-2 border-b-black py-4">
                {" "}
                <span className="w-48 rounded-md bg-gray-700">{`\u200B`}</span>
            </div>
            <div className="overflow-x-auto overflow-y-scroll ">
                {createSkeleton(25)}
            </div>
        </>
    );
}
