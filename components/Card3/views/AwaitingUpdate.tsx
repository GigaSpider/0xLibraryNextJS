import { useSwapStore } from "@/hooks/store/zustand";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";

export default function AwaitingUpdate() {
  const { XMR_DEPOSIT_ADDRESS } = useSwapStore();
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev === "") return ".";
        if (prev === ".") return "..";
        if (prev === "..") return "...";
        return "";
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-violet-500 h-[350px] w-[350px]">
      <CardHeader>
        <CardTitle className="text-center">Swap ETH ➡️ XMR</CardTitle>
      </CardHeader>
      <CardContent>
        Awaiting Monero Deposit Address from the blockchain, please wait{dots}
        {XMR_DEPOSIT_ADDRESS as string}
      </CardContent>
    </Card>
  );
}
