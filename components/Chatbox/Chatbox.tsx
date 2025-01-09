"use client";

import { Rnd } from "react-rnd";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Channel, useChatStore } from "@/hooks/store/chatStore";
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import Main from "@/components/Chatbox/channels/Main";
import Business from "@/components/Chatbox/channels/Business";
import Mysogyny from "./channels/Misogyny";
import Racism from "./channels/Racism";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Chatbox() {
  const { set_username } = useChatStore();

  const [usernameInput, setUsernameInput] = useState("");
  const [size, setSize] = useState({ width: 300, height: 300 });
  const [position, setPosition] = useState({ x: -300, y: -300 });
  const [isOpen, setIsOpen] = useState(false);
  const [channel, setChannel] = useState(Channel.MAIN);

  const renderChannel = () => {
    switch (channel) {
      case Channel.MAIN:
        return <Main />;
      case Channel.BUSINESS:
        return <Business />;
      case Channel.MISOGYNY:
        return <Mysogyny />;
      case Channel.RACISM:
        return <Racism />;
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[1000]">
      {isOpen && (
        <>
          <Rnd
            default={{
              width: 300,
              height: 300,
              x: -300,
              y: -300,
            }}
            size={{ width: size.width, height: size.height }}
            position={position}
            enableResizing={{
              top: true,
              right: false,
              bottom: false,
              left: true,
              topRight: false,
              bottomRight: false,
              bottomLeft: false,
              topLeft: true,
            }}
            disableDragging={true}
            minWidth={200}
            minHeight={200}
            onResize={(e, direction, ref, delta, position) => {
              setSize({
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height),
              });
              setPosition(position);
            }}
            onDrag={(e, d) => {
              setPosition({ x: d.x, y: d.y });
            }}
          >
            <div className="flex flex-col h-full w-full border border-violet-500">
              <div className="relative h-10">
                <Input
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      set_username(usernameInput.trim());
                      setUsernameInput(""); // Optional: clear input after setting
                    }
                  }}
                  placeholder="Enter username(Optional)"
                  className="absolute left-1 top-2 z-[1002]"
                />
                <Button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-1 top-2 z-[1002]"
                  variant="ghost"
                >
                  ⌄ Hide Trollbox
                </Button>
                <Separator className="absolute bottom-0 w-full" />
              </div>

              <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup
                  direction="horizontal"
                  className="h-full rounded-lg border"
                >
                  <ResizablePanel defaultSize={25} minSize={20}>
                    <div>
                      <Button
                        variant="ghost"
                        onClick={() => setChannel(Channel.MAIN)}
                      >
                        #main
                      </Button>
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        onClick={() => setChannel(Channel.BUSINESS)}
                      >
                        #business
                      </Button>
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        onClick={() => setChannel(Channel.RACISM)}
                      >
                        #racism
                      </Button>
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        onClick={() => setChannel(Channel.MISOGYNY)}
                      >
                        #misogyny
                      </Button>
                    </div>
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={75}>
                    {renderChannel()}
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </div>
          </Rnd>
        </>
      )}

      {!isOpen && (
        <Button onClick={() => setIsOpen(true)} variant="ghost">
          ^Trollbox (Not Available in India)
        </Button>
      )}
    </div>
  );
}
