"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Contract, BrowserProvider, Interface, getAddress, Log } from "ethers";
import { useSwapStore } from "@/hooks/store";
import { useEthXmrContractListener } from "@/hooks/listeners";
import { isMoneroAddress } from "./utils";
import MASTER from "@/components/Contracts/MASTER.json";
import ETH_XMR from "@/components/Contracts/ETH_XMR.json";

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

export default function Card2() {
  const { toast } = useToast();

  const [input, setInput] = useState("");

  const {
    signer,
    provider,
    ETH_XMR_ADDRESS,
    ETH_XMR_ETHERSCAN_LINK,
    XMR_TXID,
    update_ETH_XMR_ADDRESS,
    update_signer,
    update_provider,
  } = useSwapStore();

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

          const getprovider = new BrowserProvider(window.ethereum);

          update_provider(getprovider);

          const getSigner = await provider!.getSigner();

          update_signer(getSigner);

          const contractABI = MASTER.abi;

          const contractAddress = process.env.MASTER_ADDRESS!;

          console.log("Master contract address: ", contractAddress);

          const MASTER_UNSIGNED: Contract = new Contract(
            contractAddress,
            contractABI,
            signer,
          );

          const gasEstimate =
            await MASTER_UNSIGNED.CreateXmrEthContract.estimateGas(input);

          console.log("Gas estimate:", gasEstimate);

          console.log("Connecting to contract");

          const MASTER_SIGNED = MASTER_UNSIGNED.connect(signer) as Contract;

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

          const tx = await MASTER_SIGNED.CreateEthXmrContract(
            hashedAddressString,
            {
              gasLimit: 500000, // Adjusted dynamically if needed
            },
          );
          console.log("Transaction sent:", tx);

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

          const address = getAddress(receipt.logs[0].topics[2].slice(-40));

          update_ETH_XMR_ADDRESS(address);

          console.log("Subcontract Address:", ETH_XMR_ADDRESS);
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

  useEthXmrContractListener();

  useEffect(() => {
    console.log(XMR_TXID);
  }, [XMR_TXID]);

  return ETH_XMR_ADDRESS ? (
    <Card className="border-violet-500 h-[350px] w-[350px]">
      <CardHeader>
        <CardTitle className="text-center">Swap ETH ➡️ XMR</CardTitle>
        <CardDescription>Deposit Ethereum</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline">
          <Link
            href={ETH_XMR_ETHERSCAN_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Etherscan
          </Link>
        </Button>
        <Input
          type="text"
          placeholder="quantity of eth to deposit "
          value={quantityEthInput}
          onChange={(e) => setQuantityEthInput(e.target.value)}
        />
        <br />
        <div className="flex h-5 items-center">
          {ethQuantity}
          <Separator orientation="vertical" />
          {xmrQuantity}
        </div>
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
  ) : (
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
