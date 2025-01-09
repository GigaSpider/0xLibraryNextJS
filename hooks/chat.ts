"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useChatStore } from "./store/chatStore";
import { useEffect } from "react";

export function useChatHook() {
  const {
    set_MAIN_messages,
    set_BUSINESS_messages,
    set_POLITICS_messages,
    set_CRYPTOCURRENCY_messages,
  } = useChatStore();

  const MAIN_messages = useQuery(api.functions.chat.getMessages, {
    channelId: "MAIN",
  });
  console.log(MAIN_messages);
  const BUSINESS_messages = useQuery(api.functions.chat.getMessages, {
    channelId: "BUSINESS",
  });
  const POLITICS_messages = useQuery(api.functions.chat.getMessages, {
    channelId: "POLITICS",
  });
  const CRYPTOCURRENCY_messages = useQuery(api.functions.chat.getMessages, {
    channelId: "CRYPTOCURRENCY",
  });

  useEffect(() => {
    if (MAIN_messages) set_MAIN_messages(MAIN_messages);
    if (BUSINESS_messages) set_BUSINESS_messages(BUSINESS_messages);
    if (POLITICS_messages) set_POLITICS_messages(POLITICS_messages);
    if (CRYPTOCURRENCY_messages)
      set_CRYPTOCURRENCY_messages(CRYPTOCURRENCY_messages);
  }, [
    MAIN_messages,
    BUSINESS_messages,
    POLITICS_messages,
    CRYPTOCURRENCY_messages,
    set_MAIN_messages,
    set_BUSINESS_messages,
    set_POLITICS_messages,
    set_CRYPTOCURRENCY_messages,
  ]);
}

export function useSendMessage() {
  const sendMessageMutation = useMutation(api.functions.chat.sendMessage);

  async function sendMessage(message: {
    channelId: string;
    author: string;
    text: string;
  }) {
    if (!message || !message.text.trim()) return;

    try {
      await sendMessageMutation(message);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }

  return { sendMessage };
}
