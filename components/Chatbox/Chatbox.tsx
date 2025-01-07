import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useChatStore, Message } from "@/hooks/store/chatStore";
import { useChat } from "@/hooks/chat";
import { useState } from "react";

export default function Chatbox() {
  const { messages } = useChatStore(); // Access the messages from the store
  const { sendMessage } = useChat(); // Access sendMessage to handle sending
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      const message: Message = {
        user_id: "anonymous",
        sender: "anonymous",
        message: input,
        time: Date.now(),
      };
      sendMessage(message); // Send the message
      setInput(""); // Clear the input field
    }
  };

  return (
    <Collapsible>
      <CollapsibleTrigger>Trollbox ^</CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col h-[300px] border border-gray-300 p-4 overflow-hidden">
          <div className="flex-1 overflow-y-auto mb-4">
            {messages.map((msg) => (
              <div key={msg.time} className="mb-2">
                <strong>{msg.sender}:</strong> {msg.message}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border border-gray-300 rounded-md"
            />
            <Button
              onClick={handleSend}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Send
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
