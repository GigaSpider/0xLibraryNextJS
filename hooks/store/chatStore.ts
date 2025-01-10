import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Message = {
  _creationTime: number;
  channelId: string;
  author: string;
  text: string;
  timestamp: number;
};

export enum Channel {
  MAIN = "main",
  BUSINESS = "business",
  POLITICS = "politics",
  CRYPTOCURRENCY = "cryptocurrency",
}

type ChatStore = {
  messages: Message[];
  MAIN_messages: Message[];
  BUSINESS_messages: Message[];
  POLITICS_messages: Message[];
  CRYPTOCURRENCY_messages: Message[];
  username: string;
  channel: Channel;
  lastTimestamps: Record<Channel, number>; // Track lastTimestamp for each channel
  set_username: (username: string) => void;
  set_channel: (channel: Channel) => void;
  set_messages: (message: Message[] | Message) => void;
  set_MAIN_messages: (message: Message[] | Message) => void;
  set_BUSINESS_messages: (message: Message[] | Message) => void;
  set_POLITICS_messages: (message: Message[] | Message) => void;
  set_CRYPTOCURRENCY_messages: (message: Message[] | Message) => void;
  setLastTimestamp: (channel: Channel, lastTimestamp: number) => void; // Update lastTimestamp for a specific channel
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],
      MAIN_messages: [],
      BUSINESS_messages: [],
      POLITICS_messages: [],
      CRYPTOCURRENCY_messages: [],
      channel: Channel.MAIN,
      username: "anonymous",
      lastTimestamps: {
        [Channel.MAIN]: 0,
        [Channel.BUSINESS]: 0,
        [Channel.POLITICS]: 0,
        [Channel.CRYPTOCURRENCY]: 0,
      },

      set_username: (newUsername: string) =>
        set(() => ({ username: newUsername })),

      set_channel: (newChannel: Channel) =>
        set(() => ({
          channel: newChannel,
        })),

      setLastTimestamp: (channel: Channel, latestTimestamp: number) =>
        set((state) => ({
          lastTimestamps: {
            ...state.lastTimestamps,
            [channel]: latestTimestamp,
          },
        })),

      set_messages: (newMessages) =>
        set((state) => ({
          messages: Array.isArray(newMessages)
            ? [...state.messages, ...newMessages]
            : [...state.messages, newMessages],
        })),

      set_MAIN_messages: (newMessages) =>
        set((state) => ({
          MAIN_messages: Array.isArray(newMessages)
            ? [...state.MAIN_messages, ...newMessages]
            : [...state.MAIN_messages, newMessages],
        })),

      set_BUSINESS_messages: (newMessages) =>
        set((state) => ({
          BUSINESS_messages: Array.isArray(newMessages)
            ? [...state.BUSINESS_messages, ...newMessages]
            : [...state.BUSINESS_messages, newMessages],
        })),

      set_POLITICS_messages: (newMessages) =>
        set((state) => ({
          POLITICS_messages: Array.isArray(newMessages)
            ? [...state.POLITICS_messages, ...newMessages]
            : [...state.POLITICS_messages, newMessages],
        })),

      set_CRYPTOCURRENCY_messages: (newMessages) =>
        set((state) => ({
          CRYPTOCURRENCY_messages: Array.isArray(newMessages)
            ? [...state.CRYPTOCURRENCY_messages, ...newMessages]
            : [...state.CRYPTOCURRENCY_messages, newMessages],
        })),
    }),
    {
      name: "chat-store", // Key for localStorage
      partialize: (state) => ({
        lastTimestamps: state.lastTimestamps, // Persist only lastTimestamps
      }),
    },
  ),
);
