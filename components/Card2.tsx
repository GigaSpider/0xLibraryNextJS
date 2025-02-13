"use client";

import ContractInitialization from "@/components/Card2/views/ContractInitialization";
import { useEthXmrContractListener } from "@/hooks/listeners";

export default function Card2() {
  // const { ETH_XMR_ADDRESS } = useSwapStore();

  useEthXmrContractListener();

  return <ContractInitialization />;
}
