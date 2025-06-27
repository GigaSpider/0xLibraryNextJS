"use client";

import { Rnd } from "react-rnd";
import { Button } from "@/components/ui/button";
import { Tools } from "@/components/Toolbox/ProgramInterface";
import { Loader2 } from "lucide-react";

import React, { useState, lazy, Suspense } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const ZKSecretGenerator = lazy(
  () => import("@/components/Toolbox/zksnark/ZKSecretGenerator"),
);
const ZKProofGenerator = lazy(
  () => import("@/components/Toolbox/zksnark/ZKProofGenerator"),
);
const ZKWithdrawalAgent = lazy(
  () => import("@/components/Toolbox/zksnark/ZKWithdrawalAgent"),
);
const ECDSAEncrypt = lazy(
  () => import("@/components/Toolbox/ECDSA/ECDSAEncrypt"),
);
const ECDSADecrypt = lazy(
  () => import("@/components/Toolbox/ECDSA/ECDSADecrypt"),
);

export default function ToolBox() {
  const [size, setSize] = useState({ width: 700, height: 500 });
  const [position, setPosition] = useState({ x: -16, y: -450 }); // Visible position
  const [isOpen, setIsOpen] = useState(false);
  const [toolState, setToolState] = useState("");

  return (
    <div className="z-[1000]">
      {/* Rnd is always mounted, visibility toggled */}
      <Rnd
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
        minWidth={500}
        minHeight={400}
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
        style={{
          visibility: isOpen ? "visible" : "hidden",
          zIndex: 1000,
          border: "2px solid cyan", // Light gray border for top and right
          borderLeft: "none", // Remove left border
          borderBottom: "none", // Remove bottom border
          borderTopRightRadius: "16px", // Round top-right corner
          overflow: "hidden", // Ensure content respects rounded corners
        }}
      >
        <div className="flex flex-col h-full w-full bg-black relative">
          <div className="absolute top-0 left-0 w-3 h-3" />
          <div className="relative h-10">
            <Button
              onClick={() => setIsOpen(false)}
              className="absolute right-1 z-[1002]"
              variant="ghost"
            >
              Hide Tools
            </Button>
          </div>

          <div className="flex-1 overflow-hidden">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={20}>
                {Tools.map((tool) => (
                  <div key={tool.name}>
                    <Button
                      variant="ghost"
                      onClick={() => setToolState(tool.name)}
                    >
                      <span className="text-green-400">{tool.description}</span>
                    </Button>
                  </div>
                ))}
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={80}>
                <ScrollArea className="h-full">
                  <Suspense
                    fallback={
                      <div className="p-4 text-gray-400 flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading tool...
                      </div>
                    }
                  >
                    <div
                      style={{
                        display:
                          toolState === "ZK Secret Generator"
                            ? "block"
                            : "none",
                      }}
                    >
                      <ZKSecretGenerator />
                    </div>
                    <div
                      style={{
                        display:
                          toolState === "ZK Proof Generator" ? "block" : "none",
                      }}
                    >
                      <ZKProofGenerator />
                    </div>
                    <div
                      style={{
                        display: toolState === "ZK Agent" ? "block" : "none",
                      }}
                    >
                      <ZKWithdrawalAgent />
                    </div>
                    <div
                      style={{
                        display:
                          toolState === "EcDSA Encrypt" ? "block" : "none",
                      }}
                    >
                      <ECDSAEncrypt />
                    </div>
                    <div
                      style={{
                        display:
                          toolState === "EcDSA Decrypt" ? "block" : "none",
                      }}
                    >
                      <ECDSADecrypt />
                    </div>
                    {toolState === "" && (
                      <div className="p-4 text-gray-400">
                        Select a tool to get started.
                      </div>
                    )}
                  </Suspense>
                </ScrollArea>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      </Rnd>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="text-xs hover:bg-gray-600 hover:text-black text-gray-600 border-gray-600 transition-colors no-underline"
      >
        Encryption Tools 🛠
      </Button>
    </div>
  );
}
