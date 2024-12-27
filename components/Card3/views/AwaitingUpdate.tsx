import { useSwapStore } from "@/hooks/store/zustand";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AwaitingUpdate() {
  const { XMR_ETH_ETHERSCAN_LINK, XMR_DEPOSIT_ADDRESS } = useSwapStore();

  return (
    <Card className="border-violet-500 h-[350px] w-[350px]">
      <CardHeader>
        <CardTitle className="text-center">Swap ETH ➡️ XMR</CardTitle>
        <CardDescription>Awaiting Monero Deposit Address</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full">
          <Link
            href={XMR_ETH_ETHERSCAN_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Etherscan
          </Link>
        </Button>
        {XMR_DEPOSIT_ADDRESS as string}
      </CardContent>
    </Card>
  );
}
