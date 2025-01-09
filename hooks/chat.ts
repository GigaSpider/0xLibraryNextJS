import { useChatStore, Message, Channel } from "./store/chatStore";
import { useEffect } from "react";
import Pusher from "pusher-js";

// Create a single Pusher instance
const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  forceTLS: true, // Add this
});

export function useChat() {
  const {
    messages,
    set_MAIN_messages,
    set_BUSINESS_messages,
    set_MISOGYNY_messages,
    set_RACISM_messages,
  } = useChatStore();

  useEffect(() => {
    // Subscribe to channels
    const channels = {
      main: pusherClient.subscribe("main"),
      business: pusherClient.subscribe("business"),
      racism: pusherClient.subscribe("racism"),
      misogyny: pusherClient.subscribe("misogyny"),
    };

    // Bind events
    channels.main.bind("message", (message: Message) => {
      set_MAIN_messages(message);
    });

    channels.business.bind("message", (message: Message) => {
      set_BUSINESS_messages(message);
    });

    channels.racism.bind("message", (message: Message) => {
      set_RACISM_messages(message);
    });

    channels.misogyny.bind("message", (message: Message) => {
      set_MISOGYNY_messages(message);
    });

    // Cleanup
    return () => {
      channels.main.unbind_all();
      channels.business.unbind_all();
      channels.racism.unbind_all();
      channels.misogyny.unbind_all();

      pusherClient.unsubscribe("main");
      pusherClient.unsubscribe("business");
      pusherClient.unsubscribe("racism");
      pusherClient.unsubscribe("misogyny");
    };
  }, [
    set_MAIN_messages,
    set_BUSINESS_messages,
    set_MISOGYNY_messages,
    set_RACISM_messages,
  ]);

  async function sendMessage(channel: Channel, message: Message) {
    if (!message) return;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, message }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  return { messages, sendMessage };
}
