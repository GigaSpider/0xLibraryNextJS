"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Staging from "@/components/Staging";
import Inputs from "@/components/Inputs";
import Outputs from "@/components/Outputs";

export default function Home() {
  // const { MASTER_ADDRESS, ETH_XMR_ADDRESS, XMR_ETH_ADDRESS } = useSwapStore();
  // const { provider } = useMetaMask();
  console.log("testing");
  console.log("Contract Address:", process.env.CONTRACT_ADDRESS);
  console.log("Public Address:", process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);

  // return (
  //   <div className="min-h-screen">
  //     <div
  //       className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-6 h-screen mx-auto max-w-[90%]

  // "
  //     >
  //       <Staging />
  //       <Inputs />
  //       <Outputs />
  //     </div>
  //   </div>
  // );

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="w-full h-full rounded-lg"
    >
      <ResizablePanel>
        <Staging />
      </ResizablePanel>
      <ResizableHandle className="border-x border-violet-500" />
      <ResizablePanel>
        <Inputs />
      </ResizablePanel>
      <ResizableHandle className="border-x border-violet-500" />
      <ResizablePanel>
        <Outputs />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
