"use client";

import WalletActions from "@/components/Wallet/WalletActions";
import WalletInfo from "@/components/Wallet/WalletInfo";
import Balances from "@/components/Wallet/Balances";
export default function Header() {
  return (
    <header className="flex fixed top-0 w-full justify-between items-center px-4 py-6 bg-black">
      <div className="flex-1 flex justify-start">
        <WalletActions />
      </div>
      <div className="flex-1 flex justify-center">
        <WalletInfo />
      </div>
      <div className="flex-1 flex justify-end">
        <Balances />
      </div>
    </header>
  );
}
