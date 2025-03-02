"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ContractInitialization from "@/components/Card2/views/ContractInitialization";
import { useEthXmrContractListener } from "@/hooks/listeners";
import { useContractStore } from "@/hooks/store/contractStore";

export default function Card2() {
  // const { ETH_XMR_ADDRESS } = useSwapStore();

  useEthXmrContractListener();
  const { SELECTED_CONTRACT, INITIALIZED_CONTRACT } = useContractStore();

  return (
    <Card className="border-violet-500 w-full md:w-1/3 min-w-[200px] aspect-square bg-black flex flex-col">
      <CardHeader className="text-center">
        <CardTitle>Stage Contract</CardTitle>
        {SELECTED_CONTRACT ? (
          INITIALIZED_CONTRACT ? (
            <CardDescription>Proxy Contract Deployed</CardDescription>
          ) : (
            <></>
          )
        ) : (
          <CardDescription>Select a contract from the library</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ContractInitialization />
      </CardContent>
    </Card>
  );
}

// export default function Card2() {
//   // const { ETH_XMR_ADDRESS } = useSwapStore();

//   useEthXmrContractListener();

//   return <ContractInitialization />;
// }
