// import { useSwapStore } from "@/hooks/store/zustand";
// import { useMetaMask } from "@/hooks/useMetaMask";
// import { parseEther } from "ethers";
// import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useContractStore } from "@/hooks/store/contractStore";
import ProxyInterface from "./ProxyInterface";
import ProxyDisplay from "./ProxyDisplay";
import NonProxyInterface from "./NonProxyInterface";

export default function InitializationMenu() {
  const { SELECTED_CONTRACT, INITIALIZED_CONTRACT } = useContractStore();
  return (
    <ScrollArea className="h-80 w-full overflow-hidden">
      <div className="w-full max-w-full box-border">
        {SELECTED_CONTRACT?.proxy ? (
          INITIALIZED_CONTRACT ? (
            <ProxyDisplay />
          ) : (
            <ProxyInterface />
          )
        ) : (
          <NonProxyInterface />
        )}
      </div>
    </ScrollArea>
  );
}
