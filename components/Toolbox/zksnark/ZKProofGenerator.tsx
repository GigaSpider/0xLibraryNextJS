"use client";

import * as snarkjs from "snarkjs";
import { useToast } from "@/hooks/use-toast";
import { utils } from "ffjavascript";
import { buildMimcSponge } from "circomlibjs";
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
import {
  AbiCoder,
  Contract,
  Interface,
  ZeroAddress,
  isAddress,
  hexlify,
  zeroPadValue,
  toBeArray,
} from "ethers";
import { MerkleTree } from "fixed-merkle-tree";
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

const MERKLE_TREE_HEIGHT = 20;

const formSchema = z.object({
  preimage: z.string().nonempty({ message: "Required" }),
  destination: z.string().nonempty({ message: "Required" }),
});

type GenerateProofForm = z.infer<typeof formSchema>;

export default function ZKProofGenerator() {
  const [response, setResponse] = useState<string | null>(null);
  const [isGenerateLoading, setIsGenerateLoading] = useState(false);
  const { contracts } = useContractStore();
  const { providers } = useWalletStore();

  const { toast } = useToast();

  const contract_object = contracts[2];

  const contract: Contract = new Contract(
    contract_object!.address,
    contract_object!.abi,
    providers![3],
    // currently set to Sepolia
  );

  const GenerateForm = useForm<GenerateProofForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preimage: "",
      destination: "",
    },
  });

  async function onGenerateSubmit(data: GenerateProofForm) {
    setIsGenerateLoading(true);
    // const pedersen = await buildPedersenHash();
    // const babyJubs = await buildBabyjub();

    if (!isAddress(data.destination)) {
      toast({
        title: "Form Error",
        description: "invalid address",
        variant: "destructive",
      });
      setIsGenerateLoading(false);
      return;
    }

    // const pedersenHash = (data: string | Buffer<ArrayBufferLike>) => {
    //   return babyJubs.unpackPoint(pedersen.hash(data))[0];
    // };

    // console.log(
    //   "First try catch block checkpoint: fetching merkle tree data from the contract",
    // );

    const { preimage, destination } = data;

    const decodedBuffer = Buffer.from(preimage.trim().slice(2), "hex");

    const x = utils.leBuff2int(decodedBuffer.subarray(0, 31));
    const y = utils.leBuff2int(decodedBuffer.subarray(31, 62));
    const hashX = utils.leBuff2int(decodedBuffer.subarray(62, 94));
    const commitment = utils.leBuff2int(decodedBuffer.subarray(94));

    // const { root } = await getMerkleTreeData();
    const { root, pathElements, pathIndices } = await getMerkleTreeData();
    console.log({ root });

    // const recipient = destination;
    // const relayer = "none";
    // const fee = "0";
    // const refund = "";

    try {
      console.log("entering try block for proof");

      const input = {
        root: root!.toString(),
        nullifierHash: hashX.toString(),
        recipient: destination,
        relayer: "",
        fee: "",
        refund: "",
        nullifier: x.toString(),
        secret: y.toString(),
        pathElements: pathElements!.map((e) => e.toString()),
        pathIndices: pathIndices!.map((i) => i.toString()),
      };

      console.log("getting Merkle Tree Data from contract...");

      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        "/withdraw.wasm",
        "/withdraw_0001.zkey",
      );

      console.log("response successful");

      console.log("Proof output:", proof);

      setIsGenerateLoading(false);

      // 1. Prepare the proof bytes correctly
      const rawCalldata = await snarkjs.groth16.exportSolidityCallData(
        proof,
        publicSignals,
      );
      const calldata = JSON.parse("[" + rawCalldata + "]");
      console.log("Parsed calldata:", JSON.stringify(calldata, null, 2));

      // Check the structure of proof parts
      // const pi_a = calldata[0];
      // const pi_b = calldata[1];
      // const pi_c = calldata[2];

      let proofBytes = "";

      // Add pi_a (first two values)
      proofBytes += calldata[0][0].slice(2); // Remove 0x prefix
      proofBytes += calldata[0][1].slice(2);

      // Add pi_b (2x2 matrix)
      proofBytes += calldata[1][0][0].slice(2);
      proofBytes += calldata[1][0][1].slice(2);
      proofBytes += calldata[1][1][0].slice(2);
      proofBytes += calldata[1][1][1].slice(2);

      // Add pi_c (last two values)
      proofBytes += calldata[2][0].slice(2);
      proofBytes += calldata[2][1].slice(2);

      // Add 0x prefix to complete the bytes value
      const solidityProof = "0x" + proofBytes;

      console.log("Constructed solidityProof:", solidityProof);
      // 2. Convert root and nullifierHash to bytes32
      const rootBytes32 = hexlify(
        zeroPadValue(toBeArray(BigInt(input.root)), 32),
      );
      const nullifierHashBytes32 = hexlify(
        zeroPadValue(toBeArray(BigInt(input.nullifierHash)), 32),
      );

      // 3. Use proper address types
      const recipientAddress = data.destination; // Already an address
      const relayerAddress = ZeroAddress; // Use zero address if empty

      const fee = 0;
      const refund = 0;

      // 4. Encode with correct types
      const encodedProof = AbiCoder.defaultAbiCoder().encode(
        [
          "bytes", // Combined proof
          "bytes32", // Root
          "bytes32", // NullifierHash
          "address", // Recipient
          "address", // Relayer
          "uint256", // Fees
          "uint256", // Refunds
        ],
        [
          solidityProof,
          rootBytes32,
          nullifierHashBytes32,
          recipientAddress,
          relayerAddress,
          fee,
          refund,
        ],
      );

      console.log("Solidity Inputs:", encodedProof);

      setResponse(encodedProof);

      //for litmus checking purposes

      const decodedProof = AbiCoder.defaultAbiCoder().decode(
        [
          "bytes", // Combined proof
          "bytes32", // Root
          "bytes32", // NullifierHash
          "address", // Recipient
          "address", // Relayer
          "uint256", // Fees
          "uint256", // Refunds
        ],
        encodedProof,
      );
      console.log({ decodedProof });
    } catch (error) {
      console.error("Error generating proof:", error);
      setIsGenerateLoading(false);
    }

    async function getMerkleTreeData() {
      console.log("Checkpoint, parsing logs from contract");

      const mimcSponge = await buildMimcSponge();
      const mimcHasher = (
        left: string | number | bigint,
        right: string | number | bigint,
      ) => {
        return mimcSponge.F.toString(
          mimcSponge.multiHash([BigInt(left), BigInt(right)]),
        );
      };

      try {
        const event_logs = await contract.queryFilter("DepositEvent");

        const contract_interface: Interface = contract.interface;

        console.log(contract_interface);

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

        console.log("parsed_logs", parsed_logs);

        const leaves = parsed_logs
          .sort((a, b) => Number(a!.args.leafIndex) - Number(b!.args.leafIndex))
          .map((event) => event!.args.commitment);

        console.log("leaves", leaves);

        const depositEvent = parsed_logs.find(
          (e) => e!.args.commitment === "0x" + commitment.toString(16),
        );

        console.log("depositEvent", depositEvent);

        const tree = new MerkleTree(MERKLE_TREE_HEIGHT, leaves, {
          hashFunction: mimcHasher,
          zeroElement: "0",
        });

        // let depositEvent = parsed_logs.find(
        //   (e) => e.returnValues.commitment === "0x" + commitment.toString(16),
        // );
        // let leafIndex = depositEvent ? depositEvent.returnValues.leafIndex : -1;

        const leafIndex: number = depositEvent
          ? Number(depositEvent.args[1])
          : -1;

        console.log({ leafIndex });

        // const ecommitment: Element = ("0x" +
        //   BigInt(commitment!).toString(16).padStart(32, "0")) as Element;

        // const proof = tree.proof(ecommitment);

        // const pathElements = proof.pathElements;
        const { pathElements, pathIndices } = tree.path(leafIndex);
        const treelen = tree.elements.length;
        const root = tree.root;

        console.log({
          tree,
          treelen,
          // proof,
          pathElements,
          pathIndices,
          root,
        });

        // const tree = new MerkleTree(20, []);
        // console.log({ commitment });
        // const ecommitment: Element = ("0x" +
        //   BigInt(commitment!).toString(16).padStart(32, "0")) as Element;
        // tree.insert(ecommitment);
        // const path = tree.proof(ecommitment);
        // console.log(path);

        return {
          root,
          pathElements,
          pathIndices,
        };
      } catch (error) {
        console.error(error);
        toast({
          title: "Error getting Merkle Data",
          description: `${error}`,
          variant: "destructive",
        });
        return { error: error };
      }
    }
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
                  <FormLabel>Private Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter PrivateKey" {...field} />
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

// proof in progress
//
// public commitment 0x1a7d8adf18ef007e7e0474f9ba4eed8b9f33d19e480afa948f8a47e3d8f8204a
//
// private key 0x0ecdc87477b73bf4494bad31a90e72b1b30cc620877921fcc627d36c180b151edf757e2957bf96819da1651458a24a0940b32d538d1b479b277eb3ebf294b586abbb780ec361c3db7816adf7a6430d582fb8e08e63e0aeb55efe6e4aac274a20f8d8e3478a8f94fa0a489ed1339f8bed4ebaf974047e7e00ef18df8a7d1a
