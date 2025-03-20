"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import {
  Interface,
  Contract,
  Log,
  Result,
  Wallet,
  isAddress,
  InterfaceAbi,
} from "ethers";
import { useContractStore } from "@/hooks/store/contractStore";
import { useWalletStore } from "@/hooks/store/walletStore";
import { useState } from "react";
import { Loader2 } from "lucide-react";

// Define explicit types for ABI
interface AbiInput {
  name: string;
  type: string;
}

interface AbiItem {
  type: string;
  name?: string;
  inputs: AbiInput[];
}

interface SelectedContract {
  name: string;
  master_address: string;
  description: string;
  network: string;
  master_abi: AbiItem[];
  abi: InterfaceAbi;
  function_name: string;
  event_name: string;
  mapping_name?: string;
}

const connectContractSchema = z.object({
  contractAddress: z.string(),
});
type ConnectContractForm = z.infer<typeof connectContractSchema>;

export default function ProxyInterface() {
  const { SELECTED_CONTRACT, set_INITIALIZED_CONTRACT } = useContractStore();
  const { private_key, providers } = useWalletStore();
  const { toast } = useToast();
  const [isDeployLoading, setIsDeployLoading] = useState(false);
  const [isConnectLoading, setIsConnectLoading] = useState(false);

  const deployProxyContract = async (
    data: Record<string, string>,
  ): Promise<Result[] | Error> => {
    if (!providers || !private_key) {
      throw new Error("providers or wallet not available");
    }

    const selectedContract = SELECTED_CONTRACT as SelectedContract | null;
    if (!selectedContract) {
      throw new Error("No contract selected");
    }

    let network_index = 0;
    switch (selectedContract.network) {
      case "Mainnet":
        network_index = 0;
        break;
      case "Optimism":
        network_index = 1;
        break;
      case "Arbitrum":
        network_index = 2;
        break;
      default:
        network_index = 0;
    }

    const wallet = new Wallet(private_key, providers[network_index]);

    const master_address = selectedContract.master_address;
    const proxy_abi = selectedContract.abi;
    const master_abi = selectedContract.master_abi as unknown as InterfaceAbi;
    const function_name = selectedContract.function_name;
    const event_name = selectedContract.event_name;

    const master_contract = new Contract(master_address, master_abi, wallet);

    console.log("checkpoint, calling deploy proxy function on blockchain");

    const iface = new Interface(master_abi);

    const deployFunction = iface.getFunction(function_name);
    if (!deployFunction) {
      throw new Error("Function not found in abi");
    }

    console.log(data);
    console.log(deployFunction);
    console.log("checkpoint 1, attempting to deploy contract");

    try {
      const tx = await master_contract[function_name](...Object.values(data));
      const receipt = await tx.wait();

      console.log("checkpoint 2, receipt received");

      let returnArgs: Result[] = [];
      let proxy_address = "";

      if (receipt && receipt.logs) {
        receipt.logs.forEach((log: Log) => {
          try {
            const parsed = iface.parseLog({
              topics: log.topics as string[],
              data: log.data,
            });
            if (parsed && parsed.name === event_name) {
              proxy_address = parsed.args[0] as string;
              returnArgs = [...parsed.args];
            } else {
              proxy_address = "error";
            }
          } catch (error) {
            console.log("Error parsing log:", error);
          }
        });
      }

      const proxy_contract = new Contract(proxy_address, proxy_abi, wallet);

      console.log(
        "checkpoint 3, proxy contract address received: ",
        proxy_address,
      );

      set_INITIALIZED_CONTRACT(proxy_contract);

      return returnArgs;
    } catch (error) {
      const typedError = error as Error & { code?: string };
      if (typedError.code === "INSUFFICIENT_FUNDS") {
        toast({
          title: "PROXY DEPLOYMENT ERROR",
          description: "Insufficient Funds.",
          variant: "destructive",
        });
      }
      console.log(error);
      return typedError;
    }
  };

  const connectProxyContract = async (
    address: string,
  ): Promise<Contract | Error> => {
    console.log(address);

    const selectedContract = SELECTED_CONTRACT as SelectedContract | null;
    if (!selectedContract) {
      return new Error("No contract selected");
    }

    let network_index = 0;
    switch (selectedContract.network) {
      case "Mainnet":
        network_index = 0;
        break;
      case "Optimism":
        network_index = 1;
        break;
      case "Arbitrum":
        network_index = 2;
        break;
      default:
        return new Error("Invalid network");
    }

    if (!providers || !private_key) {
      return new Error("providers or wallet not available");
    }

    try {
      const wallet = new Wallet(private_key, providers[network_index]);

      const master_contract = new Contract(
        selectedContract.master_address,
        selectedContract.master_abi as unknown as InterfaceAbi,
        wallet,
      );

      // Add verification that mapping exists
      if (!selectedContract.mapping_name) {
        return new Error("Mapping function name not specified");
      }

      try {
        const result =
          await master_contract[selectedContract.mapping_name](address);

        if (result === wallet.address) {
          const proxy_contract = new Contract(
            address,
            selectedContract.abi,
            wallet,
          );
          set_INITIALIZED_CONTRACT(proxy_contract);
          return proxy_contract;
        } else {
          return new Error(
            "Contract not owned by this address, interaction prohibited",
          );
        }
      } catch (error) {
        const typedError = error as Error & { code?: string };
        if (typedError.code === "BAD_DATA") {
          return new Error("Contract not found in mapping");
        }
        return typedError;
      }
    } catch (error) {
      console.log("Error connecting proxy contract:", error);
      return error as Error;
    }
  };

  const selectedContract = SELECTED_CONTRACT as SelectedContract | null;
  const functionAbi: AbiItem | undefined = selectedContract?.master_abi?.find(
    (item: AbiItem) =>
      item.type === "function" && item.name === selectedContract.function_name,
  );

  const deployDefaultValues: Record<string, string> = functionAbi
    ? functionAbi.inputs.reduce(
        (acc: Record<string, string>, param: AbiInput) => {
          acc[param.name] = "";
          return acc;
        },
        {},
      )
    : {};

  // Create dynamic schema
  const deploySchemaFields =
    functionAbi?.inputs.reduce(
      (acc: Record<string, z.ZodString>, param: AbiInput) => {
        acc[param.name] = z
          .string()
          .nonempty({ message: `${param.name} is required` });
        return acc;
      },
      {},
    ) || {};

  const deployContractSchema = z.object(deploySchemaFields);
  type DeployContractForm = Record<string, string>;

  const deployForm = useForm<DeployContractForm>({
    resolver: zodResolver(deployContractSchema),
    defaultValues: deployDefaultValues,
  });

  const connectForm = useForm<ConnectContractForm>({
    resolver: zodResolver(connectContractSchema),
    defaultValues: {
      contractAddress: "",
    },
  });

  async function onDeploySubmit(data: DeployContractForm) {
    setIsDeployLoading(true);
    console.log("Deploying contract with data:", data);
    try {
      const blockchain_confirmation = await deployProxyContract(data);
      console.log("Confirmation: ", blockchain_confirmation);
    } catch (error) {
      console.error("Deployment error:", error);
      toast({
        title: "Deployment Error",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeployLoading(false);
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
    setIsConnectLoading(true);
    try {
      const connect_confirmation = await connectProxyContract(
        data.contractAddress,
      );
      console.log("Confirmation:", connect_confirmation);
      if (connect_confirmation instanceof Error) {
        toast({
          title: "Contract connection failed",
          variant: "destructive",
          description: connect_confirmation.message,
        });
      } else {
        toast({
          title: "Contract connected successfully",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection Error",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsConnectLoading(false);
    }
  }

  return (
    <div>
      <div className="text-green-500">{selectedContract?.name}</div>
      <br />
      <div>Master Contract: {selectedContract?.master_address}</div>
      <br />
      <div>Description: {selectedContract?.description}</div>
      <br />
      <div>Deploy Proxy Contract from master with the following parameters</div>
      <br />
      <Form {...deployForm}>
        <form
          onSubmit={deployForm.handleSubmit(onDeploySubmit)}
          className="space-y-4"
        >
          {functionAbi?.inputs.map((param: AbiInput, index: number) => (
            <FormField
              key={index}
              control={deployForm.control}
              name={param.name}
              render={({ field }) => (
                <FormItem>
                  <label className="block text-sm font-medium text-gray-700">
                    {param.name} ({param.type})
                  </label>
                  <FormControl>
                    <Input placeholder={`Enter ${param.name}`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button variant="default" type="submit" className="w-full">
            {isDeployLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deploying...
              </>
            ) : (
              "Deploy Proxy Contract"
            )}
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
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button variant="secondary" type="submit" className="w-full">
            {isConnectLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Existing Proxy Contract"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
