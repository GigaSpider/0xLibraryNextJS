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
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
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
  const [moneroTransactionID, setMoneroTransactionID] = useState("");
  // const [account, setAccount] = useState(null);

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

          const contractABI = MAIN_ABI.abi;
          const contractAddress = "0x8a9B4Eb7F9efdD25cc422e8B1f2D8b9F1F3b5a89";

          const MASTER: Contract = new Contract(
            contractAddress,
            contractABI,
            signer,
          );

          const gasEstimate =
            await MASTER.createDepositAddress.estimateGas(input);

          console.log("Gas estimate:", gasEstimate);

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

          const hashedAddressString: string = hashedAddress as string;
          console.log("Hashed Monero Address:", hashedAddressString);

          const tx = await MASTER.createDepositAddress(hashedAddressString, {
            gasLimit: 500000, // Adjusted dynamically if needed
          });
          console.log("Transaction sent:", tx);

          const receipt = await tx.wait();
          console.log("Transaction confirmed:", receipt);

          const subcontractAddress = getAddress(
            receipt.logs[0].topics[2].slice(-40),
          );

          console.log("Subcontract Address:", subcontractAddress);

          setDepositAddress(subcontractAddress);
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

  useEffect(() => {
    const listenToSubcontractEvents = async () => {
      if (!depositAddress) {
        console.log(
          "Waiting for a valid deposit address to activate the listener.",
        );
        return; // Exit early if no deposit address
      }

      try {
        const provider = new BrowserProvider(window.ethereum!);
        const signer = await provider.getSigner();

        const SUBCONTRACT = new Contract(
          depositAddress,
          SUBCONTRACT_ABI.abi,
          signer,
        );

        console.log("Listening to SUBCONTRACT_SIGNED events...");

        const SUBCONTRACT_SIGNED = SUBCONTRACT.connect(signer) as Contract;

        SUBCONTRACT_SIGNED.on("ConfirmSwapSuccess", (TxID: string) => {
          console.log(
            `Swap completed successfully, Monero transaction: ${TxID}`,
          );
          setMoneroTransactionID(TxID);
        });

        SUBCONTRACT_SIGNED.on("ConfirmSwapFailure", () => {
          console.log("Swap failed, refunding ethereum");
        });

        // Clean up listener when the component unmounts
        return () => {
          SUBCONTRACT.removeAllListeners("SUBCONTRACT_SIGNED");
        };
      } catch (error) {
        console.error("Error setting up event listener:", error);
      }
    };

    listenToSubcontractEvents();
  }, [depositAddress]);

  useEffect(() => {
    console.log(moneroTransactionID);
  }, [moneroTransactionID]);

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
