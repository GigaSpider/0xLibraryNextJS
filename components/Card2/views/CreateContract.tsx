"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Interface, Log, Contract, isAddress } from "ethers";
import { useSwapStore } from "@/hooks/store/zustand";
import { useMetaMask } from "@/hooks/useMetaMask";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isMoneroAddress } from "@/components/utils";
import { useState } from "react";
import MASTER from "@/components/Contracts/MASTER.json";
import ETH_XMR from "@/components/Contracts/ETH_XMR.json";

// Define schemas for both forms
const createContractSchema = z.object({
  moneroAddress: z.string(),
});

const connectContractSchema = z.object({
  contractAddress: z.string(),
});

type CreateContractForm = z.infer<typeof createContractSchema>;
type ConnectContractForm = z.infer<typeof connectContractSchema>;

export default function CreateContract() {
  const { toast } = useToast();
  const { is_connected, update_ETH_XMR_ADDRESS, update_EXCHANGE_RATE } =
    useSwapStore();
  const { connect } = useMetaMask();
  const [isLoading, setIsLoading] = useState(false);

  // Create form instances
  const createForm = useForm<CreateContractForm>({
    resolver: zodResolver(createContractSchema),
    defaultValues: {
      moneroAddress: "",
    },
  });

  const connectForm = useForm<ConnectContractForm>({
    resolver: zodResolver(connectContractSchema),
    defaultValues: {
      contractAddress: "",
    },
  });

  async function onCreateSubmit(data: CreateContractForm) {
    if (!(await isMoneroAddress(data.moneroAddress))) {
      toast({
        title: "Not a Monero Address",
        description: "Please enter a valid Monero address",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      // Only call connect once
      const { provider: currentProvider, signer: currentSigner } =
        await connect();

      console.log("provider: ", currentProvider);
      console.log("signer: ", currentSigner);

      if (!currentProvider || !currentSigner) {
        throw new Error("Provider or signer not available");
      }

      const response = await fetch("/api/encrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moneroAddress: data.moneroAddress }),
      });

      if (!response.ok) {
        throw new Error("Failed to hash Monero address");
      }

      const { hashedAddress } = await response.json();
      console.log(hashedAddress);
      const contractAddress = process.env.NEXT_PUBLIC_MASTER_ADDRESS!;
      console.log("Contract Address ", contractAddress);
      const contract = new Contract(contractAddress, MASTER.abi, currentSigner);

      // await contract.CreateEthXmrContract.staticCall(hashedAddress, {
      //   gasLimit: 500000,
      // });

      const tx = await contract.CreateEthXmrContract(hashedAddress, {
        gasLimit: 500000,
      });
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

  async function onConnectSubmit(data: ConnectContractForm) {
    if (!isAddress(data.contractAddress)) {
      toast({
        title: "Not a Smart Contract",
        description: "Please enter a valid Ethereum Address",
        variant: "destructive",
      });
      return;
    }
    console.log("Connecting to contract:", data.contractAddress);
    // Your contract connection logic here
  }

  return (
    <Card className="border-violet-500 h-[350px] w-[350px]">
      <CardHeader>
        <CardTitle className="text-center">Swap ETH ➡️ XMR</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...createForm}>
          <form
            onSubmit={createForm.handleSubmit(onCreateSubmit)}
            className="space-y-4"
          >
            <FormField
              control={createForm.control}
              name="moneroAddress"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter Monero Output Address"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              variant="secondary"
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading
                ? "Creating Contract..."
                : is_connected
                  ? "Create Ethereum Deposit Contract"
                  : "Connect Wallet & Create Contract"}
            </Button>
          </form>
        </Form>

        <br />

        <Form {...connectForm}>
          <form
            onSubmit={connectForm.handleSubmit(onConnectSubmit)}
            className="space-y-4"
          >
            <FormField
              control={connectForm.control}
              name="contractAddress"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter Existing Swap Contract"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              variant="secondary"
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              Enter Existing Deposit Contract
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter />
    </Card>
  );
}
