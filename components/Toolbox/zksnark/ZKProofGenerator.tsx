import * as snarkjs from "snarkjs";
import { utils } from "ffjavascript";
import { hexlify, toBeHex } from "ethers";
import { buildPedersenHash } from "circomlibjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Separator } from "@/components/ui/separator"; // Changed to correct import
import { useContractStore } from "@/hooks/store/contractStore";
import { useWalletStore } from "@/hooks/store/walletStore";
import { Contract, Interface } from "ethers";
import { MerkleTree } from "fixed-merkle-tree";
// import { createSecretKey } from "node:crypto";
// import { Root } from "@radix-ui/react-dialog";

// Define the Groth16Proof type
interface Groth16Proof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: string;
  curve: string;
}

const MERKLE_TREE_HEIGHT = 32;

const formSchema = z.object({
  secret: z.string(),
  nullifier: z.string(),
  nullifierHash: z.string(),
  commitment: z.string(),
  recipient: z.string(),
});

type GenerateProofForm = z.infer<typeof formSchema>;

export default function ZKProofGenerator() {
  const [response, setResponse] = useState<Groth16Proof | null>(null);

  const { contracts } = useContractStore();
  const { providers } = useWalletStore();

  const contract_object = contracts[2];

  const contract: Contract = new Contract(
    contract_object!.address,
    contract_object!.abi,
    providers![1],
  );

  const GenerateForm = useForm<GenerateProofForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      secret: "",
      nullifier: "",
      nullifierHash: "",
      commitment: "",
      recipient: "",
    },
  });

  async function onGenerateSubmit(data: GenerateProofForm) {
    const pedersen = await buildPedersenHash();

    console.log(
      "First try catch block checkpoint: fetching merkle tree data from the contract",
    );

    const event_logs = await contract.queryFilter("DepositEvent", 0, "latest");

    const contract_interface: Interface = contract.interface;

    const parsed_logs = event_logs.map((log) => {
      const parsed_log = contract_interface.parseLog(log);
      if (parsed_log) {
        return {
          ...log,
          name: parsed_log.name,
          args: parsed_log.args,
        };
      }
    });

    const leaves = parsed_logs
      .sort((a, b) => a!.args.leafIndex - b!.args.leafIndex)
      .map((event) => event!.args.commitment);

    const tree = new MerkleTree(MERKLE_TREE_HEIGHT, leaves);

    const depositEvent = parsed_logs.find(
      (e) => e!.args.commitment === hexlify(data.commitment),
    );
    const leafIndex = depositEvent ? depositEvent.args.leafIndex : -1;

    const { pathElements, pathIndices } = tree.path(leafIndex);
    const root = tree.root;
    const recipient = data.recipient;
    const relayer = "";
    const fee = "";
    const refund = "";
    const nullifier = data.nullifier;
    const nullifierHash = data.nullifierHash;
    const secret = data.secret;

    try {
      console.log("checkpoint: attempting to resolve proof");

      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        {
          root: root,
          nullifierHash: nullifierHash,
          recipient: recipient,
          relayer: relayer,
          fee: fee,
          refund: refund,
          nullifier: nullifier,
          secret: secret,
          pathElements: pathElements,
          pathIndices: pathIndices,
        },
        "./withdraw.wasm",
        "./withdraw_final.zkey",
      );
      console.log("Proof output:", proof);
      console.log("Public Signals output:", publicSignals);
      setResponse(proof);
    } catch (error) {
      console.error("Error generating proof:", error);
    }
  }

  return (
    <div className="flex flex-col h-full text-green-400">
      <div>
        Ensure proper security considerations when withdrawing manually. You
        must use a different wallet than you deposited from and that wallet must
        have ethereum in it in order to pay for the gas fees. Use the wallet
        actions tab in order to call the withdrawal function on the zk contract
        from a different wallet
        <br />
        <br />
        <Form {...GenerateForm}>
          <form
            onSubmit={GenerateForm.handleSubmit(onGenerateSubmit)}
            className="space-y-4"
          >
            <FormField
              control={GenerateForm.control}
              name="secret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter secret" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={GenerateForm.control}
              name="nullifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nullifier</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter nullifier" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={GenerateForm.control}
              name="nullifierHash"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nullifier Hash</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter nullifier hash" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={GenerateForm.control}
              name="commitment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commitment</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter commitment" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={GenerateForm.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter recipient address" {...field} />
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
            {JSON.stringify(response)}
          </div>
        )}
        <br />
        <Separator />
      </div>
    </div>
  );
}
