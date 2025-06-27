"use client";

import { CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import {
  Interface,
  Contract,
  Log,
  Result,
  Wallet,
  isAddress,
  parseUnits,
  InterfaceAbi,
} from "ethers";
import {
  ResizablePanel,
  ResizableHandle,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
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

interface Signature {
  signature: string | null;
  signer: string | null;
  nonce: number | null;
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

// const connectContractSchema = z.object({
//   contractAddress: z.string(),
// });
// type ConnectContractForm = z.infer<typeof connectContractSchema>;

export default function ProxyInterface() {
  const { SELECTED_CONTRACT, set_INITIALIZED_CONTRACT } = useContractStore();
  const { wallet, networks } = useWalletStore();
  const { toast } = useToast();
  const [isSignLoading, setIsSignLoading] = useState(false);
  const [isDeployLoading, setIsDeployLoading] = useState(false);
  // const [isConnectLoading, setIsConnectLoading] = useState(false);
  const [signature, setSignature] = useState<Signature>({
    signature: null,
    signer: null,
    nonce: null,
  });

  const {
    master_address,
    abi,
    master_abi,
    function_name,
    event_name,
    chainId,
    // mapping_name,
  } = SELECTED_CONTRACT!;

  const deployProxyContract = async (data: Record<string, string>) => {
    setIsSignLoading(true);
    if (!networks || !wallet) {
      throw new Error("providers or wallet not available");
    }

    const selectedContract = SELECTED_CONTRACT as SelectedContract | null;
    if (!selectedContract) {
      throw new Error("No contract selected");
    }

    const etherswallet = new Wallet(wallet.private_key);

    console.log("checkpoint, calling deploy proxy function on blockchain");

    const iface = new Interface(master_abi);

    const deployFunction = iface.getFunction(function_name!);
    if (!deployFunction) {
      throw new Error("Function not found in abi");
    }

    console.log(data);
    console.log(deployFunction);
    console.log("checkpoint 1, attempting to deploy contract");

    let nonce;
    try {
      const response = await fetch("/api/GetNonce", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: etherswallet.address,
          chainId: chainId,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        console.log("nonce doesnt exist");
        throw new Error("failed to retrieve transaction count");
      }
      nonce = result.nonce;
    } catch (error) {
      console.log("error getting nonce from api", { error });
      throw new Error(`error getting nonce from api: ${error}`);
    }

    try {
      // Get the function data
      const functionData = iface.encodeFunctionData(
        function_name!,
        Object.values(data),
      );

      const txWithOptions = {
        to: master_address,
        data: functionData,
        chainId: chainId,
        gasLimit: 3000000,
        maxFeePerGas: parseUnits("2", "gwei"),
        maxPriorityFeePerGas: parseUnits("1", "gwei"),
        nonce: nonce,
      };

      const signedTx = await etherswallet.signTransaction(txWithOptions);

      const signature: Signature = {
        signer: etherswallet.address,
        signature: signedTx,
        nonce: nonce,
      };

      setSignature(signature);
      setIsSignLoading(false);
    } catch (error) {
      const typedError = error as Error & { code?: string };
      if (typedError.code === "INSUFFICIENT_FUNDS") {
        toast({
          title: "PROXY DEPLOYMENT ERROR",
          description: "Insufficient Funds.",
          variant: "destructive",
        });
      }
      setIsSignLoading(false);
      console.log(error);
    }
  };

  async function handleSendTx() {
    setIsDeployLoading(true);
    if (isAddress(signature.signer)) {
      try {
        const response = await fetch("/api/ContractFunction", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chainId: chainId,
            signature: signature.signature,
          }),
        });
        const result = await response.json();
        console.log(result);

        if (!response.ok) {
          if (result.error) {
            toast({
              title: `${function_name} rejected`,
              description: `${result.reason}`,
              variant: "destructive",
            });
          }

          setIsDeployLoading(false);
          return;
        }

        const receipt = result.receipt;

        console.log("checkpoint 2, receipt received");

        const iface = new Interface(abi);

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

        const proxy_contract = new Contract(proxy_address, abi);

        console.log(
          "checkpoint 3, proxy contract address received: ",
          proxy_address,
          returnArgs,
        );

        set_INITIALIZED_CONTRACT(proxy_contract);
      } catch (error) {
        console.log(error);
      } finally {
        setIsDeployLoading(false);
      }
    } else {
      toast({
        title: `${function_name} Execution Error`,
        description:
          "You must first sign the contract's function with valid inputs",
        variant: "destructive",
      });
      setIsDeployLoading(false);
      return;
    }
  }

  // const connectProxyContract = async (
  //   address: string,
  // ): Promise<Contract | Error> => {
  //   console.log(address);

  //   const selectedContract = SELECTED_CONTRACT as SelectedContract | null;
  //   if (!selectedContract) {
  //     return new Error("No contract selected");
  //   }

  //   if (!networks || !wallet) {
  //     return new Error("providers or wallet not available");
  //   }

  //   const etherswallet = new Wallet(wallet.private_key);

  //   const master_contract = new Contract(
  //     selectedContract.master_address,
  //     selectedContract.master_abi as unknown as InterfaceAbi,
  //     etherswallet,
  //   );

  //   if (!selectedContract.mapping_name) {
  //     return new Error("Mapping function name not specified");
  //   }

  //   try {
  //     // const result =
  //     //   await master_contract[selectedContract.mapping_name](address);

  //     const iface = new Interface(master_abi);

  //     const variableFragment = iface.getFunction(mapping_name!);

  //     const functionData = iface.encodeFunctionData(variableFragment!, [
  //       address,
  //     ]);

  //     const response = await fetch("/api/getContractDataRaw", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         chainId: 11155111,
  //         contractAddress: "0xYourContract...",
  //         callData: functionData,
  //         functionSignature: "balanceOf(address)",
  //       }),
  //     });

  //     if (result === etherswallet.address) {
  //       const proxy_contract = new Contract(
  //         address,
  //         selectedContract.abi,
  //         etherswallet,
  //       );
  //       set_INITIALIZED_CONTRACT(proxy_contract);
  //       return proxy_contract;
  //     } else {
  //       return new Error(
  //         "Contract not owned by this address, interaction prohibited",
  //       );
  //     }
  //   } catch (error) {
  //     console.log("Error connecting proxy contract:", error);
  //     return error as Error;
  //   }
  // };

  const selectedContract = SELECTED_CONTRACT;
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

  // const connectForm = useForm<ConnectContractForm>({
  //   resolver: zodResolver(connectContractSchema),
  //   defaultValues: {
  //     contractAddress: "",
  //   },
  // });

  async function onDeploySubmit(data: DeployContractForm) {
    console.log("Deploying contract with data:", data);
    try {
      await deployProxyContract(data);
      console.log("Contract signed successfully");
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

  // async function onConnectSubmit(data: ConnectContractForm) {
  //   if (!isAddress(data.contractAddress)) {
  //     toast({
  //       title: "Not a Smart Contract",
  //       description: "Please enter a valid Ethereum Address",
  //       variant: "destructive",
  //     });
  //     return;
  //   }
  //   setIsConnectLoading(true);
  //   try {
  //     const connect_confirmation = await connectProxyContract(
  //       data.contractAddress,
  //     );
  //     console.log("Confirmation:", connect_confirmation);
  //     if (connect_confirmation instanceof Error) {
  //       toast({
  //         title: "Contract connection failed",
  //         variant: "destructive",
  //         description: connect_confirmation.message,
  //       });
  //     } else {
  //       toast({
  //         title: "Contract connected successfully",
  //         variant: "default",
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Connection error:", error);
  //     toast({
  //       title: "Connection Error",
  //       description:
  //         error instanceof Error ? error.message : "Unknown error occurred",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsConnectLoading(false);
  //   }
  // }

  return (
    <div className="h-full">
      <ResizablePanelGroup
        className="text-gray-400 h-full w-full"
        direction="vertical"
      >
        <ResizablePanel defaultSize={60}>
          <ScrollArea className="h-full p-4">
            <Label>{selectedContract?.name} proxy contract</Label>
            <br />
            <br />
            <div>Master Contract: {selectedContract?.master_address}</div>
            <br />
            <div>Description: {selectedContract?.description}</div>
            <br />
            <div>
              Deploy Proxy Contract from master with the following parameters
            </div>
            <br />
          </ScrollArea>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={40}>
          <div className="h-full overflow-auto p-4">
            <div>
              <CardTitle className="text-center">
                Deploy Proxy Contract
              </CardTitle>
              <br />
            </div>
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
                          <Input
                            placeholder={`Enter ${param.name}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <div className="flex items-center gap-4 text-gray-500">
                  <div>
                    <Button variant="default" type="submit">
                      {isSignLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        </>
                      ) : (
                        "Sign"
                      )}
                    </Button>
                  </div>
                  <Separator
                    orientation="vertical"
                    className="h-6 border-l-2"
                  />
                  <div>
                    {signature.signature ? (
                      <div className="flex items-center gap-4">
                        <div className="text-gray-500">
                          <span className="text-gray-500">signed</span> with{" "}
                          <span className="text-green-400">
                            {signature.signer}
                          </span>
                        </div>
                        <Separator
                          orientation="vertical"
                          className="h-6 border-l-2"
                        />
                        <div>TxCount: {signature.nonce}</div>
                        {/* <div className="text-green-400">
                      signature {signature.signature}
                    </div> */}
                      </div>
                    ) : (
                      "unsigned"
                    )}
                  </div>
                </div>
                <br />
              </form>
            </Form>
            <Button
              variant="outline"
              className={
                signature.signature
                  ? "text-green-400 hover:bg-green-400 hover:text-black border-green-400"
                  : "text-gray-500 hover:bg-gray-500 hover:text-black border-gray-500"
              }
              onClick={handleSendTx}
            >
              {isDeployLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                <>Deploy + Initialize Proxy Contract</>
              )}
            </Button>
            <br />
            {/* To do: implement proxy contract connection and lookup
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
              <Button variant="outline" type="submit" className="w-full">
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
          </Form> */}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
