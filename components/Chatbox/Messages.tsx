import { Channel } from "@/hooks/store/chatStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/hooks/store/chatStore";
import { useWalletStore } from "@/hooks/store/walletStore";
import { useChatHook, useSendMessage } from "@/hooks/chat";
import { useState } from "react";
import { useEffect, useRef } from "react";

export default function Messages({ channel }: { channel: Channel }) {
  const [input, setInput] = useState("");
  const { messages } = useChatStore();
  const { wallet } = useWalletStore();
  useChatHook();
  const { sendMessage } = useSendMessage();

  const handleSend = () => {
    if (input.trim()) {
      const message = {
        channelId: channel,
        author: wallet ? wallet.address : "anonymous",
        text: input,
      };
      sendMessage(message);
      setInput("");
    }
  };

  let filtered_messages;

  switch (channel) {
    case "MAIN":
      filtered_messages = messages.filter((msg) => msg.channelId === "MAIN");
      break;
    case "BUSINESS":
      filtered_messages = messages.filter(
        (msg) => msg.channelId === "BUSINESS",
      );
      break;
    case "POLITICS":
      filtered_messages = messages.filter(
        (msg) => msg.channelId === "POLITICS",
      );
      break;
    case "CRYPTOCURRENCY":
      filtered_messages = messages.filter(
        (msg) => msg.channelId === "CRYPTOCURRENCY",
      );
      break;
    default:
      filtered_messages = messages;
      break;
  }

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filtered_messages]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 overflow-y-auto">
        {filtered_messages!.map((msg) => (
          <div key={`${msg.timestamp}`} className="p-2">
            <strong className="text-gray-500 text-xs">{msg.author}</strong>{" "}
            <span className="text-violet-500 text-xs">{msg.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </ScrollArea>
      <div className="p-2.5 flex gap-2 border-t">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type message..."
          className="flex-1"
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
}
