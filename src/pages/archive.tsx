import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Channel, DiscordAccount, Message } from "@prisma/client";
import TextMessage from "~/components/message/Content";
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
    take: 500,
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

      <main className="bg-discord-dark p-8 text-white">
        <div className="pl-4">
          <div>
            CHANNEL NAME: {channel?.name ? `#${channel.name}` : "LOADING"}
          </div>
          <div>{id}</div>
        </div>
        {messages.map((v) => {
          return <MessageComp msg={v} />;
        })}
      </main>
    </>
  );
};

export default ChannelArchive;
