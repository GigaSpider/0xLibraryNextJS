"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useChatStore, Channel } from "./store/chatStore";
import { useEffect } from "react";

export function useChatHook() {
  const {
    set_MAIN_messages,
    set_BUSINESS_messages,
    set_POLITICS_messages,
    set_CRYPTOCURRENCY_messages,
    lastTimestamps,
    setLastTimestamp,
  } = useChatStore();

  const MAIN_messages = useQuery(api.functions.chat.getMessages, {
    channelId: "MAIN",
    lastTimestamp: lastTimestamps.main || 0,
  });

  const BUSINESS_messages = useQuery(api.functions.chat.getMessages, {
    channelId: "BUSINESS",
    lastTimestamp: lastTimestamps.business || 0,
  });

  const POLITICS_messages = useQuery(api.functions.chat.getMessages, {
    channelId: "POLITICS",
    lastTimestamp: lastTimestamps.politics || 0,
  });

  const CRYPTOCURRENCY_messages = useQuery(api.functions.chat.getMessages, {
    channelId: "CRYPTOCURRENCY",
    lastTimestamp: lastTimestamps.cryptocurrency || 0,
  });

  useEffect(() => {
    if (MAIN_messages && MAIN_messages.length > 0) {
      set_MAIN_messages(MAIN_messages);
      setLastTimestamp(
        Channel.MAIN,
        MAIN_messages[MAIN_messages.length - 1].timestamp,
      );
    }

    if (BUSINESS_messages && BUSINESS_messages.length > 0) {
      set_BUSINESS_messages(BUSINESS_messages);
      setLastTimestamp(
        Channel.BUSINESS,
        BUSINESS_messages[BUSINESS_messages.length - 1].timestamp,
      );
    }

    if (POLITICS_messages && POLITICS_messages.length > 0) {
      set_POLITICS_messages(POLITICS_messages);
      setLastTimestamp(
        Channel.POLITICS,
        POLITICS_messages[POLITICS_messages.length - 1].timestamp,
      );
    }

    if (CRYPTOCURRENCY_messages && CRYPTOCURRENCY_messages.length > 0) {
      set_CRYPTOCURRENCY_messages(CRYPTOCURRENCY_messages);
      setLastTimestamp(
        Channel.CRYPTOCURRENCY,
        CRYPTOCURRENCY_messages[CRYPTOCURRENCY_messages.length - 1].timestamp,
      );
    }
  }, [
    MAIN_messages,
    BUSINESS_messages,
    POLITICS_messages,
    CRYPTOCURRENCY_messages,
    set_MAIN_messages,
    set_BUSINESS_messages,
    set_POLITICS_messages,
    set_CRYPTOCURRENCY_messages,
    setLastTimestamp,
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
