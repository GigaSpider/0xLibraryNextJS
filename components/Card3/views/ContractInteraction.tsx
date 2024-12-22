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

export default function ContractInteraction() {
  const { XMR_ETH_ETHERSCAN_LINK } = useSwapStore();

  return (
    <Card className="border-violet-500 h-[350px] w-[350px]">
      <CardHeader>
        <CardTitle className="text-center">Swap XMR ➡️ ETH</CardTitle>
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
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
