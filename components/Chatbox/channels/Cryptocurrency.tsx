import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/hooks/store/chatStore";
import { useChatHook, useSendMessage } from "@/hooks/chat";
import { useState } from "react";

export default function Cryptocurrency() {
  const [input, setInput] = useState("");
  const { CRYPTOCURRENCY_messages, username } = useChatStore();
  useChatHook();
  const { sendMessage } = useSendMessage();

  const handleSend = () => {
    if (input.trim()) {
      const message = {
        channelId: "CRYPTOCURRENCY",
        author: username,
        text: input,
      };
      sendMessage(message);
      setInput("");
    }
  };
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 overflow-y-auto">
        {CRYPTOCURRENCY_messages.map((msg) => (
          <div key={msg.timestamp} className="p-2">
            <strong>{msg.author}:</strong> {msg.text}
          </div>
        ))}
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
