import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useChatStore, Message, Channel } from "@/hooks/store/chatStore";
import { useChat } from "@/hooks/chat";
import { useState } from "react";

export default function Business() {
  const [input, setInput] = useState("");
  const { BUSINESS_messages, username } = useChatStore();
  const { sendMessage } = useChat();

  const handleSend = () => {
    if (input.trim()) {
      const message: Message = {
        user_id: "anonymous",
        sender: username,
        message: input,
        time: Date.now(),
      };
      sendMessage(Channel.BUSINESS, message);
      setInput("");
    }
  };
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 overflow-y-auto">
        #Business
        {BUSINESS_messages.map((msg) => (
          <div key={msg.time} className="p-2">
            <strong>{msg.sender}:</strong> {msg.message}
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
