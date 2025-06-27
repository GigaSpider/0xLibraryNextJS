import {
  Contract,
  FunctionFragment,
  Wallet,
  parseEther,
  isAddress,
  parseUnits,
} from "ethers";
import { useContractStore } from "@/hooks/store/contractStore";
import { useWalletStore, WalletObject } from "@/hooks/store/walletStore";
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

interface Signature {
  signature: string | null;
  signer: string | null;
  nonce: number | null;
}

function DynamicForm({
  func,
  contract,
  wallet,
  chainId,
}: {
  func: FunctionFragment;
  contract: Contract;
  wallet: WalletObject;
  chainId: number;
}) {
  const [isCallLoading, setIsCallLoading] = useState(false);
  const [isExecuteLoading, setIsExecuteLoading] = useState(false);
  const [signature, setSignature] = useState<Signature>({
    signature: null,
    signer: null,
    nonce: null,
  });
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

      const wallet_from_key = new Wallet(wallet.private_key);

      console.log("checkpoint, getting nonce");

      let nonce;
      try {
        const response = await fetch("/api/GetNonce", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            address: wallet_from_key.address,
            chainId: chainId,
          }),
        });
        const result = await response.json();
        nonce = result.nonce;
      } catch (error) {
        console.log("error getting nonce from api", { error });
        return;
      }

      const tx = await contract[func.name].populateTransaction(...params);

      const txWithOptions = {
        ...tx,
        ...(func.payable &&
          data.ethAmount && {
            value: parseEther(data.ethAmount as string),
          }),
        chainId: 11155111,
        gasLimit: 3000000,
        maxFeePerGas: parseUnits("2", "gwei"),
        maxPriorityFeePerGas: parseUnits("1", "gwei"),
        nonce: nonce,
      };

      const signedTx = await wallet_from_key.signTransaction(txWithOptions);

      const signature: Signature = {
        signer: wallet_from_key.address,
        signature: signedTx,
        nonce: nonce,
      };

      setSignature(signature);

      console.log({ signedTx });

      setIsCallLoading(false);
    } catch (error) {
      console.log(error);
      setIsCallLoading(false);
      return;
    }
  };

  async function handleSendTx() {
    setIsExecuteLoading(true);
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
              title: `${func.name} rejected`,
              description: `${result.reason}`,
              variant: "destructive",
            });
          }

          setIsExecuteLoading(false);
          return;
        }

        add_output(func.name, result.receipt);
      } catch (error) {
        console.log(error);
        return;
        setIsExecuteLoading(false);
      }
    } else {
      toast({
        title: `${func.name} Execution Error`,
        description:
          "You must first sign the contract's function with valid inputs",
        variant: "destructive",
      });
      setIsExecuteLoading(false);
      return;
    }
    setIsExecuteLoading(false);
  }

  return (
    <div>
      <Form {...form}>
        <form className="space-y-4" onSubmit={handleSubmit(functionSubmit)}>
          <h3 className="font-bold text-gray-500">
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
                step="0.001"
                placeholder="0.0"
                {...register("ethAmount")}
                className="border rounded p-1 w-full border-gray-700"
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
                  className="border rounded p-1 w-full border-gray-700"
                />
                {errors[fieldName] && (
                  <span className="text-red-500 text-xs">
                    {errors[fieldName]?.message?.toString()}
                  </span>
                )}
              </div>
            );
          })}
          <div className="flex items-center gap-4 text-gray-500">
            <div>
              <Button
                variant="default"
                type="submit"
                // className=" bg-green-400 text-black border-green-400"
              >
                {isCallLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  <>Sign</>
                )}
              </Button>
            </div>
            <Separator orientation="vertical" className="h-6 border-l-2" />
            <div>
              {signature.signature ? (
                <div className="flex items-center gap-4">
                  <div className="text-gray-500">
                    <span className="text-gray-500">signed</span> with{" "}
                    <span className="text-green-400">{signature.signer}</span>
                  </div>
                  <Separator
                    orientation="vertical"
                    className="h-6 border-l-2"
                  />
                  <div>TxCount: {signature.nonce}</div>
                </div>
              ) : (
                "unsigned"
              )}
            </div>
          </div>
          <div></div>
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
        {isExecuteLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          </>
        ) : (
          <>Execute</>
        )}
      </Button>
    </div>
  );
}

export default function ContractDashboard() {
  const { INITIALIZED_CONTRACT, SELECTED_CONTRACT } = useContractStore();
  const { wallet } = useWalletStore();
  const [showAdminControls, setShowAdminControls] = useState(false);

  const functions: FunctionFragment[] =
    INITIALIZED_CONTRACT?.interface.fragments.filter(
      (fragment): fragment is FunctionFragment => fragment.type === "function",
    ) || [];

  let callable_functions: FunctionFragment[] | null;

  if (showAdminControls == true) {
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
    <div>
      {payable_functions.length > 0 ? (
        <>
          <div>Payable functions</div>
          {payable_functions.map((func: FunctionFragment, index: number) => (
            <div key={index} className="p-2 border-gray-300">
              <DynamicForm
                func={func}
                contract={INITIALIZED_CONTRACT!}
                chainId={SELECTED_CONTRACT!.chainId!}
                wallet={wallet!}
              />
              <br />
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
              <DynamicForm
                func={func}
                contract={INITIALIZED_CONTRACT!}
                chainId={SELECTED_CONTRACT!.chainId!}
                wallet={wallet!}
              />
              <br />
            </div>
          ))}
        </>
      ) : (
        <></>
      )}
      {INITIALIZED_CONTRACT &&
        (!showAdminControls ? (
          <Button
            variant="ghost"
            className="text-gray-500 hover:text-black hover:bg-gray-500 border-gray-500"
            onClick={() => setShowAdminControls(true)}
          >
            Show Admin Controls
          </Button>
        ) : (
          <Button
            variant="ghost"
            className="text-red-500 hover:text-black hover:bg-red-500 border-red-500"
            onClick={() => setShowAdminControls(false)}
          >
            Hide Admin Controls
          </Button>
        ))}
      <br />
      <br />
      <br />
    </div>
  );
}
