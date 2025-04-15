"use client";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import ContractInitialization from "@/components/Staging/views/ContractInitialization";
import { useEthXmrContractListener } from "@/hooks/listeners";
import { useContractStore } from "@/hooks/store/contractStore";

export default function Staging() {
  // const { ETH_XMR_ADDRESS } = useSwapStore();

  useEthXmrContractListener();
  const { SELECTED_CONTRACT, INITIALIZED_CONTRACT } = useContractStore();

  return (
    <ScrollArea>
      <CardHeader className="text-center">
        <CardTitle>Stage Contract – Caveat Emptor</CardTitle>
        {SELECTED_CONTRACT ? (
          INITIALIZED_CONTRACT && SELECTED_CONTRACT.proxy ? (
            <CardDescription>Proxy Contract Deployed</CardDescription>
          ) : (
            <></>
          )
        ) : (
          <CardDescription>
            Select from library — overview terms, instructions and use cases
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ContractInitialization />
      </CardContent>
    </ScrollArea>
  );
}

// export default function Card2() {
//   // const { ETH_XMR_ADDRESS } = useSwapStore();

//   useEthXmrContractListener();

//   return <ContractInitialization />;
// }
