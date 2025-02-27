import { create } from "zustand";

export type Message = {
  _creationTime: number;
  channelId: string;
  author: string;
  text: string;
  timestamp: number;
};

export enum Channel {
  MAIN = "MAIN",
  BUSINESS = "BUSINESS",
  POLITICS = "POLITICS",
  CRYPTOCURRENCY = "CRYPTOCURRENCY",
}

type ChatStore = {
  // Consolidated messages from all channels
  messages: Message[];
  // User settings or metadata
  username: string;
  channel: Channel;
  // A unified last timestamp for pagination
  lastTimestamp: number;
  // Actions
  set_username: (username: string) => void;
  set_channel: (channel: Channel) => void;
  set_messages: (messages: Message[] | Message) => void;
  setLastTimestamp: (lastTimestamp: number) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  username: "unidentifiable user",
  channel: Channel.MAIN,
  lastTimestamp: 0,
  set_username: (username: string) => set({ username }),
  set_channel: (channel: Channel) => set({ channel }),
  // Append new messages if an array, otherwise append a single message.
  set_messages: (newMessages) =>
    set((state) => ({
      messages: Array.isArray(newMessages)
        ? [...state.messages, ...newMessages]
        : [...state.messages, newMessages],
    })),
  setLastTimestamp: (newTimestamp: number) =>
    set({ lastTimestamp: newTimestamp }),
}));

export default useChatStore;
