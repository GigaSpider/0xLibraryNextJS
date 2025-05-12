"use client";

import * as snarkjs from "snarkjs";
// import { Toast } from "@/components/ui/toast";
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
// import { useContractStore } from "@/hooks/store/contractStore";
// import { useWalletStore } from "@/hooks/store/walletStore";
import { AbiCoder } from "ethers";
// import { MerkleTree, Element } from "fixed-merkle-tree";
import { CopyIcon, Loader2 } from "lucide-react";

// import { wasmsnark_bn128 } from "wasmsnark";

// // Define the Groth16Proof type
// interface Groth16Proof {
//   pi_a: string[];
//   pi_b: string[][];
//   pi_c: string[];
//   protocol: string;
//   curve: string;
// }

// const MERKLE_TREE_HEIGHT = 20;

const formSchema = z.object({
  preimage: z.string().nonempty({ message: "Required" }),
  destination: z.string().nonempty({ message: "Required" }),
});

type GenerateProofForm = z.infer<typeof formSchema>;

export default function ZKProofGenerator() {
  const [response, setResponse] = useState<string | null>(null);
  const [isGenerateLoading, setIsGenerateLoading] = useState(false);

  // const { contracts } = useContractStore();
  // const { providers } = useWalletStore();

  const { toast } = useToast();

  // const contract_object = contracts[2];

  // const contract: Contract = new Contract(
  //   "0x715ee67c54bba24a05f256aedb4f6bb0ad2e06f3",
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
    setIsGenerateLoading(true);
    const pedersen = await buildPedersenHash();
    const babyJubs = await buildBabyjub();

    const pedersenHash = (data: string | Buffer<ArrayBufferLike>) => {
      return babyJubs.unpackPoint(pedersen.hash(data))[0];
    };

    console.log(
      "First try catch block checkpoint: fetching merkle tree data from the contract",
    );

    const { preimage } = data;

    const decodedBuffer = Buffer.from(preimage.trim().slice(2), "hex");

    const nullifier = utils.leBuff2int(decodedBuffer.subarray(0, 31));
    const secret = utils.leBuff2int(decodedBuffer.subarray(31));
    const nullifierHash: bigint = utils.leBuff2int(
      Buffer.from(pedersenHash(utils.leInt2Buff(nullifier, 31))),
    );

    const commitment: bigint = utils.leBuff2int(
      Buffer.from(pedersenHash(decodedBuffer)),
    );

    console.log("preimage", decodedBuffer);

    console.log("nullifier", nullifier);

    console.log("nullifier hash", nullifierHash);

    console.log("secret", secret);

    console.log(
      "commitment non converted",
      Buffer.from(pedersenHash(decodedBuffer)).toString(),
    );

    console.log("commitment", commitment);

    // const { root, pathElements, pathIndices } = await getMerkleTreeData();

    // const recipient = destination;
    // const relayer = "none";
    // const fee = "0";
    // const refund = "";

    try {
      console.log("entering try block for proof");

      const input = {
        root: "4545153141916386162143836192259102769882368778106746794036952022827171450289",
        nullifierHash:
          "19027137175049743803623751962941766172362255419566664209740033119765472965258",
        recipient: "0xD8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        relayer: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
        fee: "1000000000000000",
        refund: "0",
        nullifier:
          "344410142378928871436301712867274033804306130921771574934151126616008408896",
        secret:
          "53388718127289800018449053091626962393684120531648523656289837560003367174",
        pathElements: [
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
        ],
        pathIndices: [
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
        ],
      };

      // const circuitResponse = await fetch("/api/withdraw_constraints.json");
      // const circuit = await circuitResponse.json();
      // console.log("Circuit fetched", circuit);
      // const zkeyResponse = await fetch("/api/withdraw_constraints.json");
      // const zkey = await zkeyResponse.arrayBuffer();
      // console.log("zkey fetched", zkey);

      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        "/withdraw.wasm",
        "/withdraw_0001.zkey",
      );

      console.log("response successful");

      setIsGenerateLoading(false);

      const callData = await snarkjs.groth16.exportSolidityCallData(
        proof,
        publicSignals,
      );

      const parsedCallData = JSON.parse("[" + callData + "]");

      const pA = parsedCallData[0];
      const pB = parsedCallData[1];
      const pC = parsedCallData[2];

      const coder = AbiCoder.defaultAbiCoder();
      const encodedProof = coder.encode(
        ["uint256[2]", "uint256[2][2]", "uint256[2]"],
        [pA, pB, pC],
      );

      console.log("Proof output:", proof);
      console.log("Solidity Inputs:", encodedProof);

      setResponse(encodedProof);
    } catch (error) {
      console.error("Error generating proof:", error);
      setIsGenerateLoading(false);
    }

    // async function getMerkleTreeData() {
    //   console.log("Checkpoint, parsing logs from contract");
    //   try {
    //     const event_logs = await contract.queryFilter("DepositEvent");

    //     const contract_interface: Interface = contract.interface;

    //     console.log(contract_interface);

    //     const parsed_logs = event_logs.map((log) => {
    //       const parsed_log = contract_interface.parseLog(log);
    //       if (parsed_log) {
    //         return {
    //           ...log,
    //           name: parsed_log.name,
    //           args: parsed_log.args,
    //         };
    //       } else {
    //         toast({
    //           title: "Error gathering merkle tree data",
    //           variant: "destructive",
    //           description: "no deposit events detected on the contract",
    //         });
    //       }
    //     });

    //     console.log("parsed_logs", parsed_logs);

    //     const depositEvent = parsed_logs.find(
    //       (e) => e!.args.commitment === commitment,
    //     );

    //     console.log("depositEvent", depositEvent);

    //     const leaves = parsed_logs
    //       .sort((a, b) => a!.args.leafIndex - b!.args.leafIndex)
    //       .map((event) => event!.args.commitment);

    //     console.log("leaves", leaves);

    //     // const tree = new MerkleTree(MERKLE_TREE_HEIGHT, leaves);

    //     const ecommitment: Element = commitment.toString();
    //     const tree = new MerkleTree(MERKLE_TREE_HEIGHT, [ecommitment]);

    //     const proof = tree.proof(commitment.toString());

    //     const pathElements = proof.pathElements;
    //     const pathIndices = proof.pathIndices;

    //     const treelen = tree.elements.length;

    //     // console.log("checkpoint 1");
    //     const root = tree.root;
    //     // console.log("checkpoint 1");
    //     // const pathElements = proof.pathElements;
    //     // console.log("checkpoint 1");
    //     // const pathIndices = proof.pathIndices;

    //     console.log({
    //       tree: tree,
    //       levels: tree.levels,
    //       elements: tree.elements,
    //       treelen: treelen,
    //       proof: proof,
    //       pathElements: pathElements,
    //       pathIndices: pathIndices,
    //       // proof: proof,
    //       root: root,
    //       // pathElements: pathElements,
    //       // pathIndices: pathIndices,
    //     });

    //     // const leafIndex = depositEvent ? depositEvent.args.leafIndex : -1;

    //     return {
    //       root: root,
    //       pathElements: pathElements,
    //       pathIndices: pathIndices,
    //     };
    //   } catch (error) {
    //     console.error(error);
    //     toast({
    //       title: "Error getting Merkle Data",
    //       description: `${error}`,
    //       variant: "destructive",
    //     });
    //     return { error: error };
    //   }
    // }
  }

  return (
    <div className="flex flex-col h-full text-green-400">
      <div>
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

            <Button type="submit">
              {" "}
              {isGenerateLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Proof"
              )}
            </Button>
          </form>
        </Form>
        <Separator className="my-4" />
        Proof Generated:
        {response && (
          <div className="flex flex-col mt-4 p-4 w-full">
            <div className="flex items-center mb-2">
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => {
                  navigator.clipboard.writeText(response.toString());
                  toast({
                    description: "Commitment copied to clipboard",
                    duration: 2000,
                  });
                }}
              >
                <CopyIcon className="h-3 w-3 mr-1" />
                copy
              </Button>
            </div>
            <div className="w-full max-w-full overflow-hidden bg-black/20 rounded p-2">
              <pre className="whitespace-pre-wrap break-all text-xs text-green-400 font-mono">
                {JSON.stringify(response)}
              </pre>
            </div>
          </div>
        )}
        <br />
        <Separator />
      </div>
    </div>
  );
}
