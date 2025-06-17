"use client";

import { Rnd } from "react-rnd";
import { Button } from "@/components/ui/button";
import Messages from "./Messages";

import { Channel } from "@/hooks/store/chatStore";
import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function Chatbox() {
  const [size, setSize] = useState({ width: 700, height: 500 });
  const [position, setPosition] = useState({ x: -550, y: -450 });
  const [isOpen, setIsOpen] = useState(false);
  const [channel, setChannel] = useState(Channel.MAIN);

  return (
    <div className="z-[1000]">
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
                          <span className="text-green-400">#main</span>
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
                          <span className="text-green-400">#business</span>
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
                          <span className="text-green-400">#politics</span>
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
                          <span className="text-green-400">#crypto</span>
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

      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="text-gray-500 border-gray-500 transition-colors no-underline"
      >
        💬 Trollbox
      </Button>
    </div>
  );
}
