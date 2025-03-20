"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Contract, Interface, Log, isAddress } from "ethers";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSwapStore } from "@/hooks/store/zustand";
import { useEventStore, Event } from "@/hooks/store/eventStore";
import { useMetaMask } from "@/hooks/useMetaMask";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import MASTER from "@/components/Contracts/MASTER.json";

const createContractSchema = z.object({
  ethereumAddress: z.string(),
});

const connectContractSchema = z.object({
  contractAddress: z.string(),
});

type CreateContractForm = z.infer<typeof createContractSchema>;
type ConnectContractForm = z.infer<typeof connectContractSchema>;

export default function CreateContract() {
  const { toast } = useToast();
  const { update_XMR_ETH_ADDRESS, update_EXCHANGE_RATE } = useSwapStore();
  const { add_event } = useEventStore();
  const { connect } = useMetaMask();
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const [isConnectLoading, setIsConnectLoading] = useState(false);

  // Create form instances
  const createForm = useForm<CreateContractForm>({
    resolver: zodResolver(createContractSchema),
    defaultValues: {
      ethereumAddress: "",
    },
  });

  const connectForm = useForm<ConnectContractForm>({
    resolver: zodResolver(connectContractSchema),
    defaultValues: {
      contractAddress: "",
    },
  });

  async function onCreateSubmit(data: CreateContractForm) {
    if (!isAddress(data.ethereumAddress)) {
      toast({
        title: "Not an Ethereum Address",
        description: "Please enter a valid Ethereum address",
        variant: "destructive",
      });
      return;
    }
    setIsCreateLoading(true);
    try {
      // Only call connect once
      const { provider: currentProvider, signer: currentSigner } =
        await connect();

      console.log("provider: ", currentProvider);
      console.log("signer: ", currentSigner);

      if (!currentProvider || !currentSigner) {
        throw new Error("Provider or signer not available");
      }

      const contractAddress = process.env.NEXT_PUBLIC_MASTER_ADDRESS!;
      console.log("Contract Address ", contractAddress);
      const contract = new Contract(contractAddress, MASTER.abi, currentSigner);

      const rate = await contract.CalculateExchangeRate();
      update_EXCHANGE_RATE(rate);

      const tx = await contract.CreateXmrEthContract(data.ethereumAddress, {
        gasLimit: 500000,
      });
      const receipt = await tx.wait();

      const iface = new Interface(MASTER.abi);

      receipt.logs.forEach((log: Log) => {
        try {
          const parsedLog = iface.parseLog(log)!;

          // Check if this is the 'depositAddressCreated' event
          if (parsedLog.name === "XmrEthContractCreation") {
            // parsedLog.args now contains the event arguments
            const withdrawalAddress = parsedLog.args.withdrawalAddress;
            const subcontractAddress = parsedLog.args.subcontractAddress;

            console.log("Contract Address:", subcontractAddress);
            console.log("withdrawing to: ", withdrawalAddress);

            const event: Event = {
              event: "new XMR/ETH swap contract",
              timestamp: Date.now(),
            };

            add_event(event);

            update_XMR_ETH_ADDRESS(subcontractAddress);
            update_EXCHANGE_RATE(3500);
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
      setIsCreateLoading(false);
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

    setIsConnectLoading(true);

    try {
      console.log("connection checkpoint");
      // Only call connect once
      const { provider: currentProvider, signer: currentSigner } =
        await connect();

      console.log("provider: ", currentProvider);
      console.log("signer: ", currentSigner);

      if (!currentProvider || !currentSigner) {
        throw new Error("Provider or signer not available");
      }

      const contractAddress = process.env.NEXT_PUBLIC_MASTER_ADDRESS!;
      console.log("Contract Address ", contractAddress);
      const contract = new Contract(contractAddress, MASTER.abi, currentSigner);
      const signerAddress = currentSigner.getAddress();

      if (
        (await contract.XMR_ETH_CONTRACTS(data.contractAddress)) ==
        signerAddress
      ) {
        const event: Event = {
          event: "XMR/ETH swap contract connected",
          timestamp: Date.now(),
        };

        add_event(event);
        update_XMR_ETH_ADDRESS(data.contractAddress);
        const rate = await contract.CalculateExchangeRate();
        update_EXCHANGE_RATE(rate);
      } else if (!(await contract.XMR_ETH_CONTRACTS(data.contractAddress))) {
        toast({
          title: "Contract connection failed",
          description: "Contract doesn't exist",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Contract connection failed",
          description: "Contract is not associated with this wallet",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Contract connection failed:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Contract connection failed",
        variant: "destructive",
      });
    } finally {
      setIsConnectLoading(false);
    }
  }

  return (
    <Card className="border-violet-500 h-[400px] w-[400px]">
      <CardHeader>
        <CardTitle className="text-center">XMR ➡️ ETH</CardTitle>
        <CardDescription className="text-center">
          Contract Initialization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...createForm}>
          <form
            onSubmit={createForm.handleSubmit(onCreateSubmit)}
            className="space-y-4"
          >
            <FormField
              control={createForm.control}
              name="ethereumAddress"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter Ethereum Output Address"
                      {...field}
                      disabled={isCreateLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              variant="secondary"
              type="submit"
              disabled={isConnectLoading}
              className="w-full"
            >
              {isConnectLoading
                ? "Connecting to Contract..."
                : "Create New Contract"}
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
                      disabled={isConnectLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              variant="secondary"
              type="submit"
              disabled={isConnectLoading}
              className="w-full"
            >
              Connect Existing Contract
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter />
    </Card>
  );
}
