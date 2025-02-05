"use client";

import ContractDashboard from "@/components/Card2/views/ContractDashboard";
import CreateContract from "./Card2/views/CreateContract";
import { useSwapStore } from "@/hooks/store/zustand";
import { useEthXmrContractListener } from "@/hooks/listeners";

export default function Card2() {
  const { ETH_XMR_ADDRESS } = useSwapStore();

  useEthXmrContractListener();

  return ETH_XMR_ADDRESS ? <ContractDashboard /> : <CreateContract />;
}
