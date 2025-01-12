"use client";

import { Rnd } from "react-rnd";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Channel, useChatStore } from "@/hooks/store/chatStore";
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
import Main from "@/components/Chatbox/channels/Main";
import Business from "@/components/Chatbox/channels/Business";
import Politics from "./channels/Politics";
import Cryptocurrency from "./channels/Cryptocurrency";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

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
      case Channel.POLITICS:
        return <Politics />;
      case Channel.CRYPTOCURRENCY:
        return <Cryptocurrency />;
    }
  };

  return (
    <div className="fixed bottom-0 right-0 z-[1000]">
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
            <div className="flex flex-col h-full w-full border border-violet-500 bg-black relative">
              <div className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-[1001] border-l-2 border-t-2 border-white/30" />
              <div className="relative h-10">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost">Set Username</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] border-violet-500">
                    <DialogHeader>
                      <DialogTitle>Set Username</DialogTitle>
                      <DialogDescription>
                        Optionally set a username, will default to anonymous
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                          Username
                        </Label>
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
                          className="w-[250px]"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        onClick={() => {
                          set_username(usernameInput.trim());
                          setUsernameInput("");
                        }}
                      >
                        Update
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="absolute right-1 z-[1002]"
                  variant="ghost"
                >
                  Hide Trollbox
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
                        onClick={() => setChannel(Channel.POLITICS)}
                      >
                        #politics
                      </Button>
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        onClick={() => setChannel(Channel.CRYPTOCURRENCY)}
                      >
                        #crypto
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
