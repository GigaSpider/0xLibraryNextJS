"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Contract, getAddress, isAddress } from "ethers";
import { useSwapStore } from "@/hooks/store/store";
import { useMetaMask } from "@/hooks/useMetaMask";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import MASTER from "@/components/Contracts/MASTER.json";

export default function CreateContract() {
  const { toast } = useToast();
  const { signer, provider, is_connected, update_ETH_XMR_ADDRESS } =
    useSwapStore();
  const { connect } = useMetaMask();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleContractCreation() {
    if (!isAddress(input)) {
      toast({
        title: "Invalid Monero Address",
        description: "Please enter a valid address for your withdrawal.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (!is_connected) {
        await connect();
      }

      if (!provider || !signer) {
        throw new Error("Provider or signer not available");
      }

      const response = await fetch("/api/encrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moneroAddress: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to hash Monero address");
      }

      const { hashedAddress } = await response.json();
      const contractAddress = process.env.NEXT_PUBLIC_MASTER_ADDRESS!;
      const contract = new Contract(contractAddress, MASTER.abi, signer);

      const tx = await contract.CreateEthXmrContract(hashedAddress);
      const receipt = await tx.wait();

      const address = getAddress(receipt.logs[0].topics[2].slice(-40));
      update_ETH_XMR_ADDRESS(address);

      toast({
        title: "Success",
        description: "Deposit contract created successfully",
      });
    } catch (error) {
      console.error("Contract creation failed:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Contract creation failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-violet-500 h-[350px] w-[350px]">
      <CardHeader>
        <CardTitle className="text-center">Swap ETH ➡️ XMR</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="text"
          placeholder="Enter Ethereum Output Address"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <Button
          variant="secondary"
          type="submit"
          onClick={handleContractCreation}
          disabled={isLoading || !input}
          className="w-full"
        >
          {isLoading
            ? "Creating Contract..."
            : is_connected
              ? "Create Ethereum Deposit Contract"
              : "Connect Wallet & Create Contract"}
        </Button>
      </CardContent>
      <CardFooter />
    </Card>
  );
}
