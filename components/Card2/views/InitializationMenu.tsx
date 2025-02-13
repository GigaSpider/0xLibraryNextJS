// import { useSwapStore } from "@/hooks/store/zustand";
// import { useMetaMask } from "@/hooks/useMetaMask";
// import { parseEther } from "ethers";
// import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useContractStore } from "@/hooks/store/contractStore";
import ProxyInterface from "./ProxyInterface";
import NonProxyInterface from "./NonProxyInterface";

export default function InitializationMenu() {
  const { SELECTED_CONTRACT } = useContractStore();
  return (
    <ScrollArea className="h-80 w-full">
      {SELECTED_CONTRACT?.proxy ? <ProxyInterface /> : <NonProxyInterface />}
    </ScrollArea>
  );
}
