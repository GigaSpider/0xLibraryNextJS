import { create } from "zustand";

export type Message = {
  user_id: string;
  sender: string;
  message: string;
  time: number;
};

type ChatStore = {
  messages: Message[];
  set_messages: (message: Message[] | Message) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  set_messages: (newMessages) =>
    set((state) => ({
      messages: Array.isArray(newMessages)
        ? [...state.messages, ...newMessages]
        : [...state.messages, newMessages],
    })),
}));
