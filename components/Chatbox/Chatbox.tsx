"use client";

import { Rnd } from "react-rnd";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Messages from "./Messages";

import { Channel, useChatStore } from "@/hooks/store/chatStore";
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";
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
  const [size, setSize] = useState({ width: 700, height: 500 });
  const [position, setPosition] = useState({ x: -700, y: -500 });
  const [isOpen, setIsOpen] = useState(false);
  const [channel, setChannel] = useState(Channel.MAIN);

  return (
    <div className="fixed bottom-0 right-0 z-[1000]">
      {isOpen && (
        <>
          <Rnd
            default={{
              width: 500,
              height: 800,
              x: -500,
              y: -800,
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
            <div className="flex flex-col h-full w-full border border-gray-700-500 bg-black relative">
              <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-white/30" />
              <div className="relative h-10">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="fixed left-5 top-0.5">
                      Set Username
                    </Button>
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
                  className="h-full border"
                >
                  <ResizablePanel defaultSize={20} minSize={20}>
                    <div>
                      <Button
                        variant="ghost"
                        onClick={() => setChannel(Channel.MAIN)}
                      >
                        {channel === Channel.MAIN ? (
                          <span className="text-violet-500">#main</span>
                        ) : (
                          <>#main</>
                        )}
                      </Button>
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        onClick={() => setChannel(Channel.BUSINESS)}
                      >
                        {channel === Channel.BUSINESS ? (
                          <span className="text-violet-500">#business</span>
                        ) : (
                          <>#business</>
                        )}
                      </Button>
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        onClick={() => setChannel(Channel.POLITICS)}
                      >
                        {channel === Channel.POLITICS ? (
                          <span className="text-violet-500">#politics</span>
                        ) : (
                          <>#politics</>
                        )}
                      </Button>
                    </div>
                    <div>
                      <Button
                        variant="ghost"
                        onClick={() => setChannel(Channel.CRYPTOCURRENCY)}
                      >
                        {channel === Channel.CRYPTOCURRENCY ? (
                          <span className="text-violet-500">#crypto</span>
                        ) : (
                          <>#crypto</>
                        )}
                      </Button>
                    </div>
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={75}>
                    <Messages channel={channel} />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            </div>
          </Rnd>
        </>
      )}

      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          variant="link"
          className="text-xs hover:text-violet-500 transition-colors no-underline"
        >
          Message Channels
        </Button>
      )}
    </div>
  );
}
