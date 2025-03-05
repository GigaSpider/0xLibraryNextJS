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
import { Contract, Result, isAddress } from "ethers";
import { useContractStore } from "@/hooks/store/contractStore";
import { useInitializeContract } from "@/hooks/initializeContract";
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

const connectContractSchema = z.object({
  contractAddress: z.string(),
});
type ConnectContractForm = z.infer<typeof connectContractSchema>;

export default function ProxyInterface() {
  const { SELECTED_CONTRACT } = useContractStore();
  const { deployProxyContract, connectProxyContract } = useInitializeContract();
  const { toast } = useToast();
  const [isDeployLoading, setIsDeployLoading] = useState(false);
  const [isConnectLoading, setIsConnectLoading] = useState(false);

  const functionAbi: AbiItem | undefined = SELECTED_CONTRACT?.master_abi?.find(
    (item: AbiItem) =>
      item.type === "function" &&
      item.name === SELECTED_CONTRACT!.function_name,
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

  // Inline dynamic schema creation without an intermediate variable.
  const deployContractSchema = z.object(
    Object.fromEntries(
      functionAbi?.inputs.map((param: AbiInput) => [
        param.name,
        z.string().nonempty({ message: `${param.name} is required` }),
      ]) ?? [],
    ) as Record<string, z.ZodString>,
  );
  type DeployContractForm = z.infer<typeof deployContractSchema>;

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
    const blockchain_confirmation: Result[] | Error =
      await deployProxyContract(data);
    console.log("Confirmation: ", blockchain_confirmation);
    setIsDeployLoading(false);
    // Add your deployment logic here.
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
    const connect_confirmation: Contract | Error = await connectProxyContract(
      data.contractAddress,
    );
    console.log("Confirmation:", connect_confirmation);
    if (connect_confirmation instanceof Error) {
      toast({
        title: "Contract connection failed",
        variant: "destructive",
        description: `${connect_confirmation}`,
      });
    }
    setIsConnectLoading(false);
  }

  return (
    <div>
      <div className="text-green-500">{SELECTED_CONTRACT?.name}</div>
      <br />
      <div>Master Contract: {SELECTED_CONTRACT?.master_address}</div>
      <br />
      <div>Description: {SELECTED_CONTRACT?.description}</div>
      <br />
      <div>Deploy Proxy Contract from master with the following parameters</div>
      <br />
      <Form {...deployForm}>
        <form
          onSubmit={deployForm.handleSubmit(onDeploySubmit)}
          className=" space-y-4"
        >
          {functionAbi?.inputs.map((param: AbiInput, index: number) => (
            <FormField
              key={index}
              control={deployForm.control}
              name={param.name as keyof DeployContractForm}
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
