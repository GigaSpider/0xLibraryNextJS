"use client";

import Card1 from "@/components/Card1";
import Card2 from "@/components/Card2";
import Card3 from "@/components/Card3";
import PriceFeed from "@/components/PriceFeed";
import EnhancedContractInfo from "@/components/EnhancedContractInfo";
import Chatbox from "@/components/Chatbox/Chatbox";
import Directory from "@/components/Directory";
import { useSwapStore } from "@/hooks/store/zustand";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import WhitePaper from "@/components/WhitePaper";

export default function Home() {
  const { MASTER_ADDRESS, ETH_XMR_ADDRESS, XMR_ETH_ADDRESS } = useSwapStore();
  const [understood, setUnderstood] = useState(false);
  // const { provider } = useMetaMask();
  console.log("testing");
  console.log("Contract Address:", process.env.CONTRACT_ADDRESS);
  console.log("Public Address:", process.env.NEXT_PUBLIC_CONTRACT_ADDRESS);

  return (
    <div className="min-h-screen">
      {/* Version display on top left */}
      <div className="fixed top-2 left-2 z-50">
        <PriceFeed />
      </div>
      {/* Contract info on top right */}
      <div className="fixed top-2 right-2 w-auto z-50 space-y-1">
        {MASTER_ADDRESS && (
          <div className="flex items-center gap-2">
            <EnhancedContractInfo
              address={MASTER_ADDRESS}
              label="Master Contract"
            />
          </div>
        )}
        {ETH_XMR_ADDRESS && (
          <div className="flex items-center gap-2">
            <EnhancedContractInfo address={ETH_XMR_ADDRESS} label="ETH-XMR" />
          </div>
        )}
        {XMR_ETH_ADDRESS && (
          <div className="flex items-center gap-2">
            <EnhancedContractInfo address={XMR_ETH_ADDRESS} label="XMR-ETH" />
          </div>
        )}
      </div>
      {understood ? (
        <></>
      ) : (
        <div className="flex space-x-6 fixed top-32 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-gray-500 font-xs">
            This application uses the Optimism layer 2 for Ethereum.
          </p>
          <br />
          <Button
            onClick={() => setUnderstood(true)}
            variant="outline"
            className="font-xs"
          >
            I understand
          </Button>
        </div>
      )}
      <div className="flex justify-center items-center space-x-6 h-screen">
        <Card1 />
        <Card2 />
        <Card3 />
      </div>
      <div className="fixed bottom-2 left-2">
        <WhitePaper />
      </div>
      <div className="fixed bottom-2 left-1/2 transform -translate-x-1/2 text-center">
        <Directory />
      </div>
      <div className="fixed bottom-2 right-2">
        <Chatbox />
      </div>
    </div>
  );
}
