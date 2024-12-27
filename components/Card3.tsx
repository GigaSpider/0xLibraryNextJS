"use client";

import CreateContract from "@/components/Card3/views/CreateContract";
import ContractInteraction from "@/components/Card3/views/ContractInteraction";
import AwaitingUpdate from "@/components/Card3/views/AwaitingUpdate";
import { useXmrEthContractListener } from "@/hooks/listeners";
import { useSwapStore } from "@/hooks/store/zustand";

export default function Card3() {
  const { XMR_ETH_ADDRESS, XMR_DEPOSIT_ADDRESS } = useSwapStore();

  useXmrEthContractListener();

  return XMR_ETH_ADDRESS ? (
    XMR_DEPOSIT_ADDRESS ? (
      <ContractInteraction />
    ) : (
      <AwaitingUpdate />
    )
  ) : (
    <CreateContract />
  );
}
