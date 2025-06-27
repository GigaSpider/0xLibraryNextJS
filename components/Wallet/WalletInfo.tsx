import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { useWalletStore } from "@/hooks/store/walletStore";
import { useWalletHook } from "@/hooks/wallet";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export default function WalletInfo() {
  const { networks, wallet, price } = useWalletStore();
  const { timeUntilUpdate } = useWalletHook();

  function handleNetworkRowClick(chainId: number) {
    let openlink;
    switch (chainId) {
      case 1:
        openlink = `https://etherscan.io/address/${wallet!.wallet.address}`;
        break;
      case 10:
        openlink = `https://optimistic.etherscan.io/address/${wallet!.wallet.address}`;
        break;
      case 11155111:
        openlink = `https://sepolia.etherscan.io/address/${wallet!.wallet.address}`;
        break;
      default:
        return;
    }
    window.open(openlink, "_blank");
  }

  return (
    <div className="flex items-center gap-4 text-gray-500">
      <div>
        {wallet ? (
          <div>
            <span className="text-violet-400">{wallet.wallet.address}</span>
          </div>
        ) : (
          "Load or create new wallet using Wallet Actions"
        )}
      </div>
      <Separator orientation="vertical" className="h-6 border-l-2" />
      <div>${(Number(price) / 1e8).toFixed(2)}/eth</div>
      <Separator orientation="vertical" className="h-6 border-l-2" />
      <Popover>
        <PopoverTrigger>
          <Button
            variant="outline"
            className="text-yellow-400 transition-colors no-underline border-yellow-500  hover:bg-yellow-500 hover:text-black"
          >
            💰 Balances
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full bg-black border border-yellow-400">
          {wallet ? (
            <div>
              <Table className="text-gray-500">
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {networks.map((network) => (
                    <TableRow
                      key={network.network_name}
                      onClick={() => handleNetworkRowClick(network.chainId)}
                    >
                      <TableCell>
                        {!price ? (
                          <span className="text-red-400">err</span>
                        ) : (
                          <span className="text-green-400">ok</span>
                        )}
                      </TableCell>
                      <TableCell>{network.network_name}</TableCell>
                      <TableCell
                        className={
                          Number(network.balance) > 0 ? "text-yellow-400" : ""
                        }
                      >
                        {(Number(network.balance) / 1e18).toFixed(8)}
                      </TableCell>
                      <TableCell
                        className={
                          Number(network.balance) > 0 ? "text-yellow-400" : ""
                        }
                      >
                        $
                        {price
                          ? (
                              (Number(network.balance) / 1e26) *
                              Number(price)
                            ).toFixed(2)
                          : "n/a"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 text-gray-500 text-center">
                Blockchain data refresh in{" "}
                <span>{formatTime(timeUntilUpdate)}</span>
              </div>
            </div>
          ) : (
            <div>No wallet available</div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
