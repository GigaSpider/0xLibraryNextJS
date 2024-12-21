import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useSwapStore } from "@/hooks/store/zustand";
import { useMetaMask } from "@/hooks/useMetaMask";
import { parseEther } from "ethers";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ContractInteraction() {
  useMetaMask();
  const {
    ETH_XMR_ADDRESS,
    ETH_XMR_ETHERSCAN_LINK,
    EXCHANGE_RATE,
    XMR_TXID,
    signer,
    provider,
  } = useSwapStore();

  const [xmrAmount, setXmrAmount] = useState("");
  const [usdAmount, setUsdAmount] = useState("");
  const [ethAmount, setEthAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Update calculations when inputs change
  useEffect(() => {
    if (xmrAmount && EXCHANGE_RATE != null) {
      const ethRequired = Number(xmrAmount) / EXCHANGE_RATE;
      setEthAmount(ethRequired.toFixed(6));
      setUsdAmount((Number(xmrAmount) * 100).toFixed(2)); // Example USD rate
    } else if (usdAmount) {
      const xmr = Number(usdAmount) / 100; // Example USD rate
      setXmrAmount(xmr.toFixed(6));
      setEthAmount((xmr / (EXCHANGE_RATE as number)).toFixed(6));
    }
  }, [xmrAmount, usdAmount, EXCHANGE_RATE]);

  async function handleDeposit() {
    if (!signer || provider) return;

    setIsLoading(true);

    try {
      const tx = await signer.sendTransaction({
        to: ETH_XMR_ADDRESS,
        value: parseEther(ethAmount),
      });

      await tx.wait();
    } catch (error) {
      console.error("Deposit failed", error);
    }
  }

  return (
    <Card className="border-violet-500 h-[350px] w-[350px]">
      <CardHeader>
        <CardTitle className="text-center">Swap ETH ➡️ XMR</CardTitle>
        <CardDescription>
          Calculate and send ETH to receive XMR.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="number"
            placeholder="Amount in XMR"
            value={xmrAmount}
            onChange={(e) => {
              setXmrAmount(e.target.value);
              setUsdAmount("");
            }}
          />
          <Input
            type="number"
            placeholder="Amount in USD"
            value={usdAmount}
            onChange={(e) => {
              setUsdAmount(e.target.value);
              setXmrAmount("");
            }}
          />
          <div className="text-sm font-medium">
            ETH to send: {ethAmount} ETH
          </div>
        </div>

        <div className="space-y-2">
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleDeposit}
            disabled={!ethAmount || isLoading}
          >
            {isLoading ? "Sending..." : "Send ETH"}
          </Button>

          <Button variant="outline" className="w-full">
            <Link
              href={ETH_XMR_ETHERSCAN_LINK}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Etherscan
            </Link>
          </Button>
        </div>

        {XMR_TXID ? (
          <div>Xmr Transfer ID: {XMR_TXID}</div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Listening for XMR transfer confirmation...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
