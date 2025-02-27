"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useChatStore } from "./store/chatStore";
import { useEffect } from "react";

export function useChatHook() {
  // Assume your Zustand store now has a single messages array,
  // a unified lastTimestamp, and actions to update them.
  const { set_messages, lastTimestamp, setLastTimestamp } = useChatStore();

  // Query for all messages, using a unified lastTimestamp (or 0 if not set)
  const messagesData = useQuery(api.functions.chat.getMessages, {
    lastTimestamp: lastTimestamp,
  });

  useEffect(() => {
    if (messagesData && messagesData.length > 0) {
      // Update the consolidated messages state in your store
      set_messages(messagesData);
      // Update the unified lastTimestamp using the timestamp of the last message
      const newLastTimestamp = messagesData[messagesData.length - 1].timestamp;
      console.log(newLastTimestamp);
      setLastTimestamp(newLastTimestamp);
      console.log(lastTimestamp);
    }
  }, [messagesData, set_messages, setLastTimestamp, lastTimestamp]);

  // Optionally, return the messages from the store for your components
  return useChatStore((state) => state.messages);
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
