import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { useSwapStore } from "@/hooks/store/zustand";
import { useMetaMask } from "@/hooks/useMetaMask";
import { parseEther } from "ethers";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InitializationMenu() {
  useMetaMask();
  const { ETH_XMR_ADDRESS, EXCHANGE_RATE, XMR_TXID, signer, provider } =
    useSwapStore();

  const [xmrAmount, setXmrAmount] = useState("");
  const [ethAmount, setEthAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Update calculations when inputs change
  useEffect(() => {
    if (xmrAmount && EXCHANGE_RATE != null) {
      const exchangeRateNumber = Number(EXCHANGE_RATE.toString());
      const ethRequired = Number(xmrAmount) * exchangeRateNumber; // XMR to USD
      setEthAmount(ethRequired.toFixed(2)); // USD to XMR
    } else if (ethAmount) {
      const exchangeRateNumber = Number(EXCHANGE_RATE!.toString());
      const xmr = Number(ethAmount) / exchangeRateNumber; // USD to XMR
      setXmrAmount(xmr.toFixed(6));
    }
  }, [xmrAmount, ethAmount, EXCHANGE_RATE]);

  async function handleDeposit() {
    if (!signer || !provider) return;

    setIsLoading(true);

    try {
      const tx = await signer.sendTransaction({
        to: ETH_XMR_ADDRESS,
        value: parseEther(ethAmount),
      });

      await tx.wait();
    } catch (error) {
      console.error("Deposit failed", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-violet-500 h-[400px] w-[400px]">
      <CardHeader>
        <CardTitle className="text-center">ETH ➡️ XMR</CardTitle>
        <CardDescription className="text-center">
          Contract Dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <span className="text-orange-500 text-xs">
            XMR/ETH Exchange Rate:
          </span>
          <span className="text-green-500 text-xs"> {EXCHANGE_RATE}</span>
          <Input
            type="number"
            placeholder="Amount in XMR"
            value={xmrAmount}
            onChange={(e) => {
              setXmrAmount(e.target.value);
              setEthAmount("");
            }}
          />
          <Input
            type="number"
            placeholder="Amount in USD"
            value={ethAmount}
            onChange={(e) => {
              setEthAmount(e.target.value);
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
        </div>
      </CardContent>
      <CardFooter>
        {XMR_TXID ? (
          `Swap successful. txhash: ${XMR_TXID}`
        ) : (
          <>Awaiting confirmation, send ETH to initiate Swap</>
        )}
      </CardFooter>
    </Card>
  );
}
