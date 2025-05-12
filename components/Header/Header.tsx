"use client";

import Wallet from "@/components/Wallet/Wallet";

export default function Header() {
  return (
    <nav className="flex w-full items-center justify-between px-10 py-8">
      <Wallet />
    </nav>
  );
}
