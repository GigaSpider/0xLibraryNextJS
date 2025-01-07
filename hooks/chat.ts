import { useChatStore, Message } from "./store/chatStore";
import { useEffect } from "react";
import Pusher from "pusher-js";

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

export function useChat() {
  const { messages, set_messages } = useChatStore();

  useEffect(() => {
    const channel = pusher.subscribe("chat");

    channel.bind("message", (response: { data: Message | Message[] }) => {
      console.log("new message: ", response);

      const newMessages = response.data; // Extract the actual message(s) from the `data` property

      set_messages(newMessages); // Pass the extracted messages to your `set_messages` function
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [set_messages]);

  // Send message through an API route
  async function sendMessage(message: Message) {
    if (!message) return;

    await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  }

  return { messages, sendMessage };
}
