"use client";

import Card1 from "@/components/Card1";
import Card2 from "@/components/Card2";
import Card3 from "@/components/Card3";
import ContractInfo from "@/components/DisplayContract";
import { useSwapStore } from "@/hooks/store/zustand";

export default function Home() {
  const { MASTER_ADDRESS, ETH_XMR_ADDRESS, XMR_ETH_ADDRESS } = useSwapStore();
  return (
    <div>
      <div>
        {MASTER_ADDRESS && <ContractInfo address={MASTER_ADDRESS} />}
        {ETH_XMR_ADDRESS && <ContractInfo address={ETH_XMR_ADDRESS} />}
        {XMR_ETH_ADDRESS && <ContractInfo address={XMR_ETH_ADDRESS} />}
      </div>
      <div className="flex justify-center items-center space-x-6 h-screen">
        <Card1 />
        <Card2 />
        <Card3 />
      </div>
    </div>
  );
}
