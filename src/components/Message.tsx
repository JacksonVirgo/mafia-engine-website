import React, { useState } from "react";
import { DiscordAccount, Message } from "@prisma/client";
import Content from "./message/Content";
import Image from "next/image";

interface MessageProps {
  msg: Message & {
    author: DiscordAccount;
  };
}

function formatDate(date: Date) {
  const day = addLeadingZero(date.getDate());
  const month = addLeadingZero(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = addLeadingZero(date.getHours());
  const minutes = addLeadingZero(date.getMinutes());
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function addLeadingZero(value: number) {
  return value.toString().padStart(2, "0");
}

const Message: React.FC<MessageProps> = ({ msg }) => {
  const [date, _setDate] = useState(formatDate(msg.createdAt));
  const [avatar, _setAvatar] = useState(
    msg.author.avatarUrl ??
      "https://cdn.discordapp.com/avatars/181373580716539904/41ed47c71315e75fca9dfcb172ba0bf5.png"
  );

  return (
    <div key={msg.messageId} className="flex flex-row p-2">
      <div className="flex-shrink p-1 pr-2">
        <Image
          className="rounded-full"
          src={avatar}
          width={40}
          height={40}
          alt=""
        />
      </div>
      <div className="grow">
        <div className="flex flex-row items-center gap-4">
          <span className="font-extrabold text-white">
            {msg.author.username}
          </span>
          <span className="text-sm text-gray-500">{date}</span>
        </div>
        <Content text={msg.rawContent ?? ""} />
      </div>
    </div>
  );
};

export default Message;
