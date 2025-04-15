import * as snarkjs from "snarkjs";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Separator } from "@/components/ui/separator"; // Changed to correct import

// Define the Groth16Proof type
interface Groth16Proof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: string;
  curve: string;
}

const formSchema = z.object({
  secret1: z.string(),
  secret2: z.string(),
  merklePath: z.string(),
});

type GenerateProofForm = z.infer<typeof formSchema>;

export default function ZKProofGenerator() {
  const [response, setResponse] = useState<Groth16Proof | null>(null);

  const GenerateForm = useForm<GenerateProofForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      secret1: "",
      secret2: "",
      merklePath: "",
    },
  });

  async function onGenerateSubmit(data: GenerateProofForm) {
    try {
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        {
          secret1: data.secret1,
          secret2: data.secret2,
          merklePath: data.merklePath,
        },
        "./withdraw.wasm",
        "./withdraw_final.zkey",
      );
      console.log("Proof:", proof);
      console.log("Public Signals:", publicSignals);
      setResponse(proof);
    } catch (error) {
      console.error("Error generating proof:", error);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex overflow-y-auto m-2">
        <div>
          <Form {...GenerateForm}>
            <form
              onSubmit={GenerateForm.handleSubmit(onGenerateSubmit)}
              className="space-y-8"
            >
              <FormField
                control={GenerateForm.control}
                name="secret1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secret 1</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter secret 1" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={GenerateForm.control}
                name="secret2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secret 2</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter secret 2" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={GenerateForm.control}
                name="merklePath"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Merkle Path</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter merkle path" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type="submit">Generate Proof</Button>
            </form>
          </Form>
          <Separator className="my-4" />

          {response && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
