import { create } from "zustand";

export type Message = {
  user_id: string;
  sender: string;
  message: string;
  time: number;
};

export enum Channel {
  MAIN = "main",
  BUSINESS = "business",
  RACISM = "racism",
  MISOGYNY = "misogyny",
}

type ChatStore = {
  messages: Message[];
  MAIN_messages: Message[];
  BUSINESS_messages: Message[];
  MISOGYNY_messages: Message[];
  RACISM_messages: Message[];
  username: string;
  channel: Channel;
  set_username: (username: string) => void;
  set_channel: (channel: Channel) => void;
  set_messages: (message: Message[] | Message) => void;
  set_MAIN_messages: (message: Message[] | Message) => void;
  set_BUSINESS_messages: (message: Message[] | Message) => void;
  set_MISOGYNY_messages: (message: Message[] | Message) => void;
  set_RACISM_messages: (message: Message[] | Message) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  MAIN_messages: [],
  BUSINESS_messages: [],
  MISOGYNY_messages: [],
  RACISM_messages: [],
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

  set_MISOGYNY_messages: (newMessages) =>
    set((state) => ({
      MISOGYNY_messages: Array.isArray(newMessages)
        ? [...state.MISOGYNY_messages, ...newMessages]
        : [...state.MISOGYNY_messages, newMessages],
    })),

  set_RACISM_messages: (newMessages) =>
    set((state) => ({
      RACISM_messages: Array.isArray(newMessages)
        ? [...state.RACISM_messages, ...newMessages]
        : [...state.RACISM_messages, newMessages],
    })),
}));
