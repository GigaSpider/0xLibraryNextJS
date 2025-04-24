"use client";

import * as snarkjs from "snarkjs";
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { utils } from "ffjavascript";
import { buildPedersenHash, buildBabyjub } from "circomlibjs";
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
import { Title } from "@radix-ui/react-toast";

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
  preimage: z.string().nonempty({ message: "Required" }),
  destination: z.string().nonempty({ message: "Required" }),
});

type GenerateProofForm = z.infer<typeof formSchema>;

function base64Decode(input): bigint {}

export default function ZKProofGenerator() {
  const [response, setResponse] = useState<Groth16Proof | null>(null);

  const { contracts } = useContractStore();
  const { providers } = useWalletStore();

  const { toast } = useToast();

  const contract_object = contracts[2];

  const contract: Contract = new Contract(
    "0x715ee67c54bba24a05f256aedb4f6bb0ad2e06f3",
    contract_object!.abi,
    providers![1],
  );

  // const contract: Contract = new Contract(
  //   contract_object!.address,
  //   contract_object!.abi,
  //   providers![1],
  // );

  const GenerateForm = useForm<GenerateProofForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preimage: "",
      destination: "",
    },
  });

  async function onGenerateSubmit(data: GenerateProofForm) {
    const pedersen = await buildPedersenHash();
    const babyJubs = await buildBabyjub();

    const pedersenHash = (data) => {
      return babyJubs.unpackPoint(pedersen.hash(data))[0];
    };

    console.log(
      "First try catch block checkpoint: fetching merkle tree data from the contract",
    );

    const { preimage, destination } = data;

    const event_logs = await contract.queryFilter("DepositEvent", 0, "latest");

    const contract_interface: Interface = contract.interface;

    const buf = Buffer.from(preimage);

    const secret = utils.leBuff2int(buf.subarray(0, 31));
    const nullifier = utils.leBuff2int(buf.subarray(31));
    const nullifierHash = BigInt(pedersenHash(utils.leInt2Buff(nullifier, 31)));

    const commitment = pedersenHash(preimage);

    const parsed_logs = event_logs.map((log) => {
      const parsed_log = contract_interface.parseLog(log);
      if (parsed_log) {
        return {
          ...log,
          name: parsed_log.name,
          args: parsed_log.args,
        };
      } else {
        toast({
          title: "Error gathering merkle tree data",
          variant: "destructive",
          description: "no deposit events detected on the contract",
        });
      }
    });

    const leaves = parsed_logs
      .sort((a, b) => a!.args.leafIndex - b!.args.leafIndex)
      .map((event) => event!.args.commitment);

    const tree = new MerkleTree(MERKLE_TREE_HEIGHT, leaves);

    const depositEvent = parsed_logs.find(
      (e) => e!.args.commitment === commitment,
    );
    const leafIndex = depositEvent ? depositEvent.args.leafIndex : -1;

    const { pathElements, pathIndices } = tree.path(leafIndex);
    const root = tree.root;
    const recipient = destination;
    const relayer = "none";
    const fee = "0";
    const refund = "";

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
              name="preimage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preimage</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Preimage" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={GenerateForm.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Destination Address" {...field} />
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
