"use client";

import { CardDescription, CardTitle } from "@/components/ui/card";
import ContractInitialization from "@/components/Staging/views/ContractInitialization";
import { useEthXmrContractListener } from "@/hooks/listeners";
import { useContractStore } from "@/hooks/store/contractStore";

export default function Staging() {
  // const { ETH_XMR_ADDRESS } = useSwapStore();

  useEthXmrContractListener();
  const { SELECTED_CONTRACT, INITIALIZED_CONTRACT } = useContractStore();

  return (
    <div className="w-full h-full">
      <br />
      <CardTitle className="text-center">
        Stage Contract – Caveat Emptor
      </CardTitle>
      {SELECTED_CONTRACT ? (
        INITIALIZED_CONTRACT && SELECTED_CONTRACT.proxy ? (
          <CardDescription className="text-center">
            Proxy Contract Deployed
          </CardDescription>
        ) : (
          <></>
        )
      ) : (
        <CardDescription className="text-center">
          Select from library — overview terms, instructions and use cases
        </CardDescription>
      )}
      <br />
      <ContractInitialization />

      <br />
      <br />
      <br />
    </div>
  );
}
