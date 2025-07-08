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
import { useWalletStore } from "@/hooks/store/walletStore";
import { useWalletHook } from "@/hooks/wallet";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export default function Balances() {
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
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="text-gray-600 transition-colors no-underline hover:bg-black hover:text-yellow-500"
        >
          ⌄ Balances
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full bg-black border border-gray-900">
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
  );
}
