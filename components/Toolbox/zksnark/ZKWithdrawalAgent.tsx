import { isAddress } from "ethers";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormLabel,
  FormField,
  FormItem,
  FormControl,
} from "@/components/ui/form";
import { CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  proof: z.string().nonempty({ message: "Required" }),
  destinationAddress: z.string().nonempty({ message: "Required" }),
  contractAddress: z.string().nonempty({ message: "Required" }),
});

type RelayForm = z.infer<typeof formSchema>;

export default function ZKWithdrawalAgent() {
  const { toast } = useToast();
  const [agentResponse, setAgentResponse] = useState();

  const RelayForm = useForm<RelayForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proof: "",
      destinationAddress: "",
      contractAddress: "",
    },
  });

  async function onRelaySubmit(data: RelayForm) {
    const { proof, destinationAddress, contractAddress } = data;

    if (!isAddress(contractAddress) || !isAddress(destinationAddress)) {
      toast({
        variant: "destructive",
        title: "Input Error",
        description: "invalid contract or destination address",
      });
      return;
    }

    try {
      const body = {
        proof,
        destinationAddress,
        contractAddress,
      };
      const response = await fetch("/api/zkWithdrawalAgent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      const hash = result.confirmation;
      console.log(hash);
      setAgentResponse(hash);
    } catch (apiCallFailure) {
      console.log({ apiCallFailure });
      toast({
        title: "zkWithDrawalAgent Failure",
        description: `${apiCallFailure}`,
        variant: "destructive",
      });
      return;
    }
  }

  return (
    <div className="flex flex-col h-full m-2">
      <CardTitle className="text-green-400">
        Zero-Knowledge Succint Non-interactive Arguement of Knowledge —
        Withdrawal Agent
      </CardTitle>
      <br />
      <Form {...RelayForm}>
        <form
          onSubmit={RelayForm.handleSubmit(onRelaySubmit)}
          className="space-y-4"
        >
          <FormField
            control={RelayForm.control}
            name="proof"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Proof</FormLabel>
                <FormControl>
                  <Input placeholder="Enter preimage" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={RelayForm.control}
            name="destinationAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter destination" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={RelayForm.control}
            name="contractAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter zk deposit contract address"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit">Withdraw Ethereum</Button>
        </form>
      </Form>
      <br />
      <Separator />
      <br />
      {agentResponse && <div>{agentResponse}</div>}
    </div>
  );
}
