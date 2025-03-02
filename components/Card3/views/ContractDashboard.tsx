import { ScrollArea } from "@/components/ui/scroll-area";
import { FunctionFragment } from "ethers";
import { useContractStore } from "@/hooks/store/contractStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

function DynamicForm({ func }: { func: FunctionFragment }) {
  // Dynamically build a zod schema from the function inputs.
  const schema = z.object(
    func.inputs.reduce(
      (acc, input, i) => {
        const fieldName = input.name || `input_${i}`;
        acc[fieldName] = z.string().nonempty({ message: "Required" });
        return acc;
      },
      {} as Record<string, z.ZodTypeAny>,
    ),
  );

  // Create the form instance.
  const form = useForm({
    resolver: zodResolver(schema),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = (data: z.infer<typeof schema>) => {
    console.log(`Calling ${func.name} with data:`, data);
    // Add your contract function call logic here.
  };

  return (
    // Spread the form instance so <Form> gets all the required props.
    <Form {...form}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <h3 className="font-bold">{func.name}</h3>
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
        <Button type="submit">Call {func.name}</Button>
      </form>
    </Form>
  );
}

export default function ContractDashboard() {
  const { INITIALIZED_CONTRACT } = useContractStore();

  const functions: FunctionFragment[] =
    INITIALIZED_CONTRACT?.interface.fragments.filter(
      (fragment): fragment is FunctionFragment => fragment.type === "function",
    ) || [];

  return (
    <ScrollArea className="h-full w-full">
      {INITIALIZED_CONTRACT ? (
        functions.map((func: FunctionFragment, index: number) => (
          <div key={index} className="p-2 border-gray-300">
            <DynamicForm func={func} />
            <br />
            <Separator />
          </div>
        ))
      ) : (
        <></>
      )}
    </ScrollArea>
  );
}
