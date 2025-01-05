"use client";

import Card1 from "@/components/Card1";
import Card2 from "@/components/Card2";
import Card3 from "@/components/Card3";
import EnhancedContractInfo from "@/components/EnhancedContractInfo";
import { useSwapStore } from "@/hooks/store/zustand";

export default function Home() {
  const { MASTER_ADDRESS, ETH_XMR_ADDRESS, XMR_ETH_ADDRESS } = useSwapStore();
  console.log("testing");
  console.log("Contract Address:", process.env.CONTRACT_ADDRESS);
  console.log("Public Address:", process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);
  return (
    <div className="min-h-screen">
      {/* Version display on top left */}
      <div className="fixed top-2 left-2 z-50">
        {process.env.NEXT_PUBLIC_VERSION}
      </div>

      {/* Contract info on top right */}
      <div className="fixed top-2 right-2 w-auto z-50 space-y-1">
        {MASTER_ADDRESS && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.6)]" />
            <EnhancedContractInfo address={MASTER_ADDRESS} label="Master" />
          </div>
        )}
        {ETH_XMR_ADDRESS && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.6)]" />
            <EnhancedContractInfo address={ETH_XMR_ADDRESS} label="ETH→XMR" />
          </div>
        )}
        {XMR_ETH_ADDRESS && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.6)]" />
            <EnhancedContractInfo address={XMR_ETH_ADDRESS} label="XMR→ETH" />
          </div>
        )}
      </div>

      <div className="flex justify-center items-center space-x-6 h-screen">
        <Card1 />
        <Card2 />
        <Card3 />
      </div>
    </div>
  );
}
