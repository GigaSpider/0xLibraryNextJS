"use client";

import ContractInteraction from "@/components/Card2/views/ContractInteraction";
import CreateContract from "./Card2/views/CreateContract";
import SwapCompleted from "./Card2/views/SwapCompleted";
import { useSwapStore } from "@/hooks/store/zustand";
import { useEthXmrContractListener } from "@/hooks/listeners";

export default function Card2() {
  const { ETH_XMR_ADDRESS, XMR_TXID } = useSwapStore();

  useEthXmrContractListener();

  return ETH_XMR_ADDRESS ? (
    XMR_TXID ? (
      <SwapCompleted />
    ) : (
      <ContractInteraction />
    )
  ) : (
    <CreateContract />
  );
}
