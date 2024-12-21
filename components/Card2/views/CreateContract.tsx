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
import { Interface, Log, Contract, getAddress } from "ethers";
import { useSwapStore } from "@/hooks/store/zustand";
import { useMetaMask } from "@/hooks/useMetaMask";
import { useToast } from "@/hooks/use-toast";
import { isMoneroAddress } from "@/components/utils";
import { useState } from "react";
import MASTER from "@/components/Contracts/MASTER.json";
import ETH_XMR from "@/components/Contracts/ETH_XMR.json";

export default function CreateContract() {
  const { toast } = useToast();
  const {
    signer,
    provider,
    is_connected,
    update_ETH_XMR_ADDRESS,
    update_EXCHANGE_RATE,
  } = useSwapStore();
  const { connect } = useMetaMask();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleContractCreation() {
    if (!(await isMoneroAddress(input))) {
      toast({
        title: "Invalid Monero Address",
        description: "Please enter a valid address for your withdrawal.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Connect first and wait for it to complete
      await connect();
      // Add a small delay to allow state to update
      await new Promise((resolve) => setTimeout(resolve, 500));

      const currentProvider = provider;
      const currentSigner = signer;

      console.log(provider);
      console.log(signer);

      if (!currentProvider || !currentSigner) {
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
      console.log("Contract Address ", contractAddress);
      const contract = new Contract(contractAddress, MASTER.abi, signer);

      const tx = await contract.CreateEthXmrContract(hashedAddress);
      const receipt = await tx.wait();

      const iface = new Interface(MASTER.abi);

      receipt.logs.forEach((log: Log) => {
        try {
          const parsedLog = iface.parseLog(log)!;

          // Check if this is the 'depositAddressCreated' event
          if (parsedLog.name === "EthXmrContractCreation") {
            // parsedLog.args now contains the event arguments
            const sender = parsedLog.args.caller;
            const address = parsedLog.args.depositAddress;
            const encryptedMoneroAddress =
              parsedLog.args.encryptedMoneroAddress;
            const ethToXmrRate = parsedLog.args.ethToXmrRate;

            console.log("Sender:", sender);
            console.log("Contract Address:", address);
            console.log("hashedMoneroAddress:", encryptedMoneroAddress);
            console.log("ethToXmrRate:", ethToXmrRate.toString());

            update_ETH_XMR_ADDRESS(address);
            update_EXCHANGE_RATE(ethToXmrRate);
          } else {
            toast({
              title: "Contract Failure",
              description:
                "Failed to get smart contract info from the blockchain",
              variant: "destructive",
              duration: 5000,
            });
          }
        } catch (err) {
          console.log("Error parsing the logs", err);
        }
      });

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
          placeholder="Enter Monero Output Address"
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
        <br />
        <Input
          type="text"
          placeholder="Enter Existing Swap Contract"
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
              ? "Enter Existing Deposit Contract"
              : "Enter Existing Deposit Contract"}
        </Button>
      </CardContent>
      <CardFooter />
    </Card>
  );
}
