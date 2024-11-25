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
import { Contract, BrowserProvider, getAddress } from "ethers";
import MAIN_ABI from "@/components/Card2/MAIN_ABI.json";
import SUBCONTRACT_ABI from "@/components/Card2/SUBCONTRACT_ABI.json";

interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener?: (
    event: string,
    callback: (...args: unknown[]) => void,
  ) => void;
}

// Extend the Window interface
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export default function Card1() {
  const { toast } = useToast();

  const [input, setInput] = useState("");
  const [depositAddress, setDepositAddress] = useState("");
  const [account, setAccount] = useState(null);

  async function isMoneroAddress(address: string): Promise<boolean> {
    const validLength = address.length === 95 || address.length === 106;
    const validPrefix = address.startsWith("4") || address.startsWith("8");
    const base58Regex =
      /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
    const validCharacters = base58Regex.test(address);

    return validLength && validPrefix && validCharacters;
  }

  async function CreateEthereumDepositContract() {
    if (await isMoneroAddress(input)) {
      const input_const = input;
      if (typeof window.ethereum !== "undefined") {
        try {
          console.log("Requesting MetaMask connection...");
          const accounts = (await window.ethereum.request({
            method: "eth_requestAccounts",
          })) as string[] | undefined;

          if (!accounts || accounts.length === 0) {
            console.error("No accounts found.");
            return;
          }

          const userAccount = accounts[0];
          console.log("Connected account:", userAccount);

          const provider = new BrowserProvider(window.ethereum);

          const signer = await provider.getSigner();

          const contractABI = MAIN_ABI.abi;
          console.log(contractABI);
          const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

          const MASTER: Contract = new Contract(
            contractAddress,
            contractABI,
            signer,
          );

          console.log("Connecting to contract");

          const MASTER_SIGNED = MASTER.connect(signer) as Contract;

          console.log("Calling contract function...");

          const response = await fetch("/api/encrypt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ moneroAddress: input_const }),
          });

          if (!response.ok) {
            throw new Error("Failed to hash Monero address");
          }

          const { hashedAddress } = await response.json();
          console.log("Hashed Monero Address:", hashedAddress);

          const tx = await MASTER_SIGNED.CreateDepositAddress(hashedAddress);
          console.log("Transaction sent:", tx);

          const receipt = await tx.wait();
          console.log("Transaction confirmed:", receipt);

          const subcontractAddress = getAddress(
            receipt.logs[0].topics[2].slice(-40),
          );

          console.log("Subcontract Address:", subcontractAddress);

          const SUBCONTRACT = new Contract(
            subcontractAddress,
            SUBCONTRACT_ABI,
            signer,
          );
        } catch (error) {
          console.error("An error occurred:", error);
        }
      } else {
        console.error(
          "MetaMask is not installed. Please install MetaMask to use this feature.",
        );
      }
    } else {
      toast({
        title: "Invalid Monero Address",
        description: "Please enter a valid address for your withdrawal.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="border-violet-500 h-[350px] w-[350px]">
      <CardHeader>
        <CardTitle className="text-center">Swap ETH ➡️ XMR</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          placeholder="Enter Monero Output Address"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <br />
        <br />
        <Button
          variant="secondary"
          type="submit"
          onClick={CreateEthereumDepositContract}
        >
          Create Ethereum Deposit Contract
        </Button>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
