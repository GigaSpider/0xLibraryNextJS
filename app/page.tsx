"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Staging from "@/components/Staging";
import Inputs from "@/components/Inputs";
import Outputs from "@/components/Outputs";
import { useWebsocketConnection } from "@/hooks/websocket";

export default function Home() {
  useWebsocketConnection();

  return (
    <div className="h-full w-full pt-[85px] flex flex-col">
      <ResizablePanelGroup
        direction="horizontal"
        className="w-full h-full flex-1"
      >
        <ResizablePanel className="h-full flex flex-col">
          <div className="h-full">
            <Staging />
          </div>
        </ResizablePanel>
        <ResizableHandle className="border-x" />
        <ResizablePanel className="h-full flex flex-col">
          <div className="h-full">
            <Inputs />
          </div>
        </ResizablePanel>
        <ResizableHandle className="border-x" />
        <ResizablePanel className="h-full flex flex-col">
          <div className="h-full">
            <Outputs />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

//A fantastic tool for managing many ethereum wallets and interacting with smart contracts
