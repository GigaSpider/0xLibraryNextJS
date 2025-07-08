import { Separator } from "../ui/separator";
import { useWalletStore } from "@/hooks/store/walletStore";
import { useWebsocketStore, Status } from "@/hooks/store/websocketStore";

export default function WalletInfo() {
  const { wallet, price } = useWalletStore();
  const { status } = useWebsocketStore();
  return (
    <div className="flex items-center gap-4 text-gray-600">
      <div>
        {wallet ? (
          <div>
            <span className="text-gray-4\500">{wallet.wallet.address}</span>
          </div>
        ) : (
          "Load or create new wallet using Wallet Actions"
        )}
      </div>
      <Separator orientation="vertical" className="h-6 border-l-2" />
      <div>${(Number(price) / 1e8).toFixed(2)}/eth</div>
      <Separator orientation="vertical" className="h-6 border-l-2" />
      Websocket
      {status === Status.disconnected && (
        <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
      )}
      {status === Status.connected && (
        <span className="inline-block w-1 h-1 bg-green-500 rounded-full"></span>
      )}
      {status === Status.pending && (
        <span className="inline-block w-1 h-1 bg-orange-500 rounded-full"></span>
      )}
    </div>
  );
}
