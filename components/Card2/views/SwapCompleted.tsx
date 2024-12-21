"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useSwapStore } from "@/hooks/store/store";

export default function SwapCompleted() {
  const { XMR_TXID } = useSwapStore();

  return (
    <Card className="border-violet-500 h-[350px] w-[350px]">
      <CardHeader>
        <CardTitle className="text-center">Swap ETH ➡️ XMR</CardTitle>
        <CardDescription>Swap Completed!</CardDescription>
      </CardHeader>
      <CardContent>{XMR_TXID}</CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
