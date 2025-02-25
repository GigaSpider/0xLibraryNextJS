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
import { Result, isAddress } from "ethers";
import { useContractStore } from "@/hooks/store/contractStore";
import { useInitializeContract } from "@/hooks/initializeContract";

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

  const functionAbi: AbiItem | undefined = SELECTED_CONTRACT?.master_abi?.find(
    (item: AbiItem) =>
      item.type === "function" && item.name === SELECTED_CONTRACT.function_name,
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
    console.log("Deploying contract with data:", data);
    const blockchain_confirmation: Result[] = await deployProxyContract(data);
    console.log("Confirmation: ", blockchain_confirmation);
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
    await connectProxyContract(data.contractAddress);
    console.log("Connecting to contract:", data.contractAddress);
  }

  return (
    <div>
      <div className="text-green-500">{SELECTED_CONTRACT?.name}</div>
      <br />
      <div>Master Contract: {SELECTED_CONTRACT?.master_address}</div>
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
            Deploy Proxy Contract
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
            Connect Existing Proxy Contract
          </Button>
        </form>
      </Form>
    </div>
  );
}
