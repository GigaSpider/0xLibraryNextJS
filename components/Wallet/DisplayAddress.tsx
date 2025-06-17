import { useWalletStore } from "@/hooks/store/walletStore";

export default function DisplayAddress() {
  const { wallet } = useWalletStore();

  return (
    <div className="text-green-400">
      Current Wallet Address:{"  "}
      {wallet
        ? wallet.wallet.address
        : "Load or create new wallet using Wallet Actions"}
    </div>
  );
}
