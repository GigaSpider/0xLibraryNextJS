"use client";

import CreateContract from "@/components/Card3/views/CreateContract";
import ContractDashboard from "@/components/Card3/views/ContractDashboard";
import { useXmrEthContractListener } from "@/hooks/listeners";
import { useSwapStore } from "@/hooks/store/zustand";

export default function Card3() {
  const { XMR_ETH_ADDRESS } = useSwapStore();

  useXmrEthContractListener();

  return XMR_ETH_ADDRESS ? <ContractDashboard /> : <CreateContract />;
}
