import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSwapStore } from "@/hooks/store/zustand";

export default function ContractDashboard() {
  const { XMR_ETH_ETHERSCAN_LINK, XMR_DEPOSIT_ADDRESS } = useSwapStore();

  return (
    <Card className="border-violet-500 h-[350px] w-[350px]">
      <CardHeader>
        <CardTitle className="text-center">Swap XMR ➡️ USDC</CardTitle>
        <CardDescription>XMR/ETH Contract Interaction</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline">
          <Link
            href={XMR_ETH_ETHERSCAN_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Etherscan
          </Link>
        </Button>
        <br />
        {XMR_DEPOSIT_ADDRESS
          ? `XMR DEPOSIT ADDRESS: ${XMR_DEPOSIT_ADDRESS}`
          : "Awaiting deposit address from the blockchain. Be patient, this may take up to two minutes"}
        <br />
        {XMR_DEPOSIT_ADDRESS ? (
          "Awaiting swap confirmation, send XMR to the deposit address to initiate the Swap. Be aware of liquidity constraints, if the oracle cannot service your swap it will return xmr to your wallet"
        ) : (
          <></>
        )}
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
