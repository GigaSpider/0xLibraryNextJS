"use client";

import Staging from "@/components/Staging";
import Inputs from "@/components/Inputs";
import Outputs from "@/components/Outputs";
// import PriceFeed from "@/components/PriceFeed";
// import WebSockets from "@/components/Websockets";
import Wallet from "@/components/Wallet/Wallet";
import Chatbox from "@/components/Chatbox/Chatbox";
import Library from "@/components/Library";
// import { useSwapStore } from "@/hooks/store/zustand";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
import WhitePaper from "@/components/WhitePaper";

export default function Home() {
  // const { MASTER_ADDRESS, ETH_XMR_ADDRESS, XMR_ETH_ADDRESS } = useSwapStore();
  // const { provider } = useMetaMask();
  console.log("testing");
  console.log("Contract Address:", process.env.CONTRACT_ADDRESS);
  console.log("Public Address:", process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);

  return (
    <div className="min-h-screen">
      <div className="fixed top-2 left-2 z-50">
        <Wallet />
      </div>
      <div
        className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-6 h-screen mx-auto max-w-[90%]

"
      >
        <Staging />
        <Inputs />
        <Outputs />
      </div>
      <div className="fixed bottom-2 left-2">
        <WhitePaper />
      </div>
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 text-center">
        <Library />
      </div>
      <div className="fixed bottom-2 right-2">
        <Chatbox />
      </div>
    </div>
  );
}
