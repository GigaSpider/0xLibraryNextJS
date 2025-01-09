import { create } from "zustand";

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
  set_username: (username: string) => void;
  set_channel: (channel: Channel) => void;
  set_messages: (message: Message[] | Message) => void;
  set_MAIN_messages: (message: Message[] | Message) => void;
  set_BUSINESS_messages: (message: Message[] | Message) => void;
  set_POLITICS_messages: (message: Message[] | Message) => void;
  set_CRYPTOCURRENCY_messages: (message: Message[] | Message) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  MAIN_messages: [],
  BUSINESS_messages: [],
  POLITICS_messages: [],
  CRYPTOCURRENCY_messages: [],
  channel: Channel.MAIN,
  username: "anonymous",

  set_username: (newUsername: string) => set(() => ({ username: newUsername })),

  set_channel: (newChannel: Channel) =>
    set(() => ({
      channel: newChannel,
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
}));
