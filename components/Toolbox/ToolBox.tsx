"use client";

import { Rnd } from "react-rnd";
import { Button } from "@/components/ui/button";
import { Tools } from "@/components/Toolbox/ProgramInterface";
import ZKSecretGenerator from "@/components/Toolbox/zksnark/ZKSecretGenerator";

import React, { useState } from "react";
import { Separator } from "@/components/ui/separator";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function ToolBox() {
  const [size, setSize] = useState({ width: 700, height: 500 });
  const [position, setPosition] = useState({ x: 0, y: -500 });
  const [isOpen, setIsOpen] = useState(false);
  const [toolState, setToolState] = useState("");

  return (
    <div className="fixed bottom-0 left-0 z-[1000]">
      {isOpen && (
        <>
          <Rnd
            default={{
              width: 500,
              height: 800,
              x: 0,
              y: -800,
            }}
            size={{ width: size.width, height: size.height }}
            position={position}
            enableResizing={{
              top: true,
              right: true,
              bottom: false,
              left: false,
              topRight: true,
              bottomRight: false,
              bottomLeft: false,
              topLeft: false,
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
                  Hide Tools
                </Button>
                <Separator className="absolute bottom-0 w-full" />
              </div>

              <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup
                  direction="horizontal"
                  className="h-full border"
                >
                  <ResizablePanel defaultSize={25} minSize={25}>
                    {Tools.map((tool) => {
                      return (
                        <div key={tool.name}>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setToolState(tool.name);
                            }}
                          >
                            <span className="text-green-400">{tool.name}</span>
                          </Button>
                        </div>
                      );
                    })}
                  </ResizablePanel>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={75}>
                    {(() => {
                      switch (toolState) {
                        case "ZK-snark tool":
                          return <ZKSecretGenerator />;

                        default:
                          return null;
                      }
                    })()}
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
          className="text-xs hover:text-green-400 transition-colors no-underline"
        >
          Encryption Tools
        </Button>
      )}
    </div>
  );
}
