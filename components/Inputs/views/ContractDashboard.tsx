import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Contract,
  FunctionFragment,
  TransactionResponse,
  parseEther,
} from "ethers";
import { useContractStore } from "@/hooks/store/contractStore";
import { useWalletStore } from "@/hooks/store/walletStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

function DynamicForm({
  func,
  contract,
}: {
  func: FunctionFragment;
  contract: Contract;
}) {
  const [isCallLoading, setIsCallLoading] = useState(false);
  const { add_output } = useContractStore();
  const { toast } = useToast();
  // Dynamically build a zod schema from the function inputs.
  //
  const baseSchema = func.inputs.reduce(
    (acc, input, i) => {
      const fieldName = input.name || `input_${i}`;
      acc[fieldName] = z.string().nonempty({ message: "Required" });
      return acc;
    },
    {} as Record<string, z.ZodTypeAny>,
  );

  // Add ethAmount field for payable functions
  const schemaObj = func.payable
    ? {
        ...baseSchema,
        ethAmount: z.string().nonempty({ message: "ETH amount required" }),
      }
    : baseSchema;

  const schema = z.object(schemaObj);

  // Create the form instance.
  const form = useForm({
    resolver: zodResolver(schema),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const functionSubmit = async (data: z.infer<typeof schema>) => {
    try {
      setIsCallLoading(true);
      console.log(`Calling ${func.name} with data:`, data);

      const params = func.inputs.map((input, index) => {
        const fieldName = input.name || `input_${index}`;
        return data[fieldName];
      });

      const options = func.payable
        ? { value: parseEther(data.ethAmount as string) }
        : {};

      const tx: TransactionResponse = await contract[func.name](
        ...params,
        options,
      );
      const receipt = await tx.wait();

      if (receipt) {
        add_output(func.name, receipt);
      }

      setIsCallLoading(false);

      console.log(receipt);

      toast({
        title: "Contract Execution Success",
        description: `${func.name} called successfully!`,
      });
    } catch (error) {
      setIsCallLoading(false);
      console.log(error);
      toast({
        title: "Contract Execution Error",
        variant: "destructive",
        description: `${func.name} ran into error: ${error}`,
      });
    }
  };

  return (
    // Spread the form instance so <Form> gets all the required props.
    <Form {...form}>
      <form className="space-y-4" onSubmit={handleSubmit(functionSubmit)}>
        <h3 className="font-bold">
          {func.name.startsWith("USER") ? func.name.slice(4) : func.name}
        </h3>
        {func.payable && (
          <div>
            <label
              htmlFor={`${func.name}-ethAmount`}
              className="block text-sm font-medium"
            >
              ETH Amount to Send
            </label>
            <Input
              id={`${func.name}-ethAmount`}
              type="number"
              step="0.0001"
              placeholder="0.0"
              {...register("ethAmount")}
              className="border rounded p-1 w-full"
            />
            {errors.ethAmount && (
              <span className="text-red-500 text-xs">
                {errors.ethAmount?.message?.toString()}
              </span>
            )}
          </div>
        )}
        {func.inputs.map((input, idx) => {
          const fieldName = input.name || `input_${idx}`;
          return (
            <div key={idx}>
              <label
                htmlFor={`${func.name}-${fieldName}`}
                className="block text-sm"
              >
                {fieldName} ({input.type})
              </label>
              <Input
                id={`${func.name}-${fieldName}`}
                type="text"
                {...register(fieldName)}
                className="border rounded p-1 w-full"
              />
              {errors[fieldName] && (
                <span className="text-red-500 text-xs">
                  {errors[fieldName]?.message?.toString()}
                </span>
              )}
            </div>
          );
        })}
        <Button variant="secondary" type="submit">
          {isCallLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deploying...
            </>
          ) : (
            <>
              Execute{" "}
              {func.name.startsWith("USER") ? func.name.slice(4) : func.name}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}

export default function ContractDashboard() {
  const { INITIALIZED_CONTRACT } = useContractStore();
  const { wallet } = useWalletStore();

  const functions: FunctionFragment[] =
    INITIALIZED_CONTRACT?.interface.fragments.filter(
      (fragment): fragment is FunctionFragment => fragment.type === "function",
    ) || [];

  let callable_functions: FunctionFragment[] | null;

  const user_address: string = wallet?.address as string;
  const oracle_address: string = process.env.NEXT_PUBLIC_ORACLE_ADDRESS!;

  if (user_address == oracle_address) {
    callable_functions = functions;
  } else {
    callable_functions = functions.filter((func) =>
      func.name.startsWith("USER"),
    );
  }

  const payable_functions: FunctionFragment[] | null =
    callable_functions.filter((func) => func.payable == true);

  const nonpayable_functions: FunctionFragment[] | null =
    callable_functions.filter((func) => func.payable == false);

  return (
    <ScrollArea className="h-full w-full">
      {payable_functions.length > 0 ? (
        <>
          <div>Payable functions</div>
          {payable_functions.map((func: FunctionFragment, index: number) => (
            <div key={index} className="p-2 border-gray-300">
              <DynamicForm func={func} contract={INITIALIZED_CONTRACT!} />
              <br />
              <Separator />
            </div>
          ))}
        </>
      ) : (
        <></>
      )}

      {callable_functions.length > 0 ? (
        <>
          <div>Non payable</div>
          {nonpayable_functions.map((func: FunctionFragment, index: number) => (
            <div key={index} className="p-2 border-gray-300">
              <DynamicForm func={func} contract={INITIALIZED_CONTRACT!} />
              <br />
              <Separator />
            </div>
          ))}
        </>
      ) : (
        <></>
      )}
    </ScrollArea>
  );
}
