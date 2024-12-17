"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  isAddress,
  BrowserProvider,
  Contract,
  Interface,
  Log,
  getAddress,
} from "ethers";
import MASTER from "@/components/Contracts/MASTER.json";
import XMR_ETH from "@/components/Contracts/XMR_ETH.json";

interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener?: (
    event: string,
    callback: (...args: unknown[]) => void,
  ) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export default function Card3() {
  const { toast } = useToast();

  const [input, setInput] = useState("");

  async function CreateMoneroDepositContract() {
    if (isAddress(input)) {
      const input_const = input;

      if (typeof window.ethereum !== "undefined") {
        try {
          console.log("Requesting MetaMask connection...");
          const accounts = (await window.ethereum.request({
            method: "eth_requestAccounts",
            params: [{ chainId: "0xAA36A7" }],
          })) as string[] | undefined;

          if (!accounts || accounts.length === 0) {
            console.error("No accounts found.");
            return;
          }

          const userAccount = accounts[0];
          console.log("Connected account:", userAccount);

          const provider = new BrowserProvider(window.ethereum);

          const signer = await provider.getSigner();

          const contractABI = MASTER.abi;

          const contractAddress = process.env.MASTER_ADDRESS!;

          const MASTER_UNSIGNED: Contract = new Contract(
            contractAddress,
            contractABI,
            signer,
          );

          const gasEstimate =
            await MASTER_UNSIGNED.CreateXmrEthContract.estimateGas(input);

          console.log("Gas estimate:", gasEstimate);

          console.log("Connecting to the contract");

          const MASTER_SIGNED = MASTER_UNSIGNED.connect(signer) as Contract;

          const tx = await MASTER_SIGNED.CreateXmrEthContract(input_const);

          console.log("tx sent: ", tx);

          const receipt = await tx.wait();
          console.log("Transaction confirmed:", receipt);

          const iface = new Interface(contractABI);

          console.log("checkpoint 1");

          receipt.logs.forEach((log: Log) => {
            try {
              const parsedLog = iface.parseLog(log)!;

              // Check if this is the 'depositAddressCreated' event
              if (parsedLog.name === "depositAddressCreated") {
                // parsedLog.args now contains the event arguments
                const sender = parsedLog.args.caller;
                const clone = parsedLog.args.depositAddress;
                const hashedMoneroAddress = parsedLog.args.hashedMoneroAddress;
                const ethToXmrRate = parsedLog.args.ethToXmrRate;

                console.log("Sender:", sender);
                console.log("Clone:", clone);
                console.log("hashedMoneroAddress:", hashedMoneroAddress);
                console.log("ethToXmrRate:", ethToXmrRate.toString());
              }
            } catch (err) {
              console.log("Error parsing the logs", err);
            }
          });

          console.log("checkpoint 2");

          const XMR_ETH_ADDRESS = getAddress(
            receipt.logs[0].topics[2].slice(-40),
          );

          console.log("XMR to ETH contract address: ", XMR_ETH_ADDRESS);
        } catch (error) {
          console.log(error);
        }
      }
      // Add logic for creating the Ethereum deposit contract
      toast({
        title: "Success",
        description: "Monero deposit contract created.",
      });
    } else {
      toast({
        title: "Invalid Ethereum Address",
        description: "Please enter a valid address for your withdrawal.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="border-violet-500 h-[350px] w-[350px]">
      <CardHeader>
        <CardTitle className="text-center">Swap XMR ➡️ ETH</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          placeholder="Enter Ethereum Output Address"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <br />
        <br />
        <Button
          variant="secondary"
          type="submit"
          onClick={CreateMoneroDepositContract}
        >
          Create Monero Deposit Contract
        </Button>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
