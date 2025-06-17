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
// import verification_key from "./verification_key.json";

import {
  AbiCoder,
  Contract,
  Interface,
  isAddress,
  hexlify,
  zeroPadValue,
  toBeArray,
} from "ethers";
import { MerkleTree } from "fixed-merkle-tree";
import { CopyIcon, Loader2 } from "lucide-react";

const MERKLE_TREE_HEIGHT = 20;

const formSchema = z.object({
  preimage: z.string().nonempty({ message: "Required" }),
  contractAddress: z.string().nonempty({ message: "Required" }),
});

type GenerateProofForm = z.infer<typeof formSchema>;

export default function ZKProofGenerator() {
  const [response, setResponse] = useState<string | null>(null);
  const [isGenerateLoading, setIsGenerateLoading] = useState(false);
  const { contracts } = useContractStore();
  const { networks } = useWalletStore();

  const { toast } = useToast();

  const contract_object = contracts[2];

  const GenerateForm = useForm<GenerateProofForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preimage: "",
      contractAddress: "",
    },
  });

  async function onGenerateSubmit(data: GenerateProofForm) {
    if (!isAddress(data.contractAddress)) {
      toast({
        variant: "destructive",
        title: "Input Error",
        description: "invalid contract address",
      });
    }
    setIsGenerateLoading(true);

    const { preimage } = data;

    const decodedBuffer = Buffer.from(preimage.trim().slice(2), "hex");

    const x = utils.leBuff2int(decodedBuffer.subarray(0, 31));
    const y = utils.leBuff2int(decodedBuffer.subarray(31, 62));
    const hashX = utils.leBuff2int(decodedBuffer.subarray(62, 94));
    const commitment = utils.leBuff2int(decodedBuffer.subarray(94));

    const result = await getMerkleTreeData(data.contractAddress);

    if (!result) {
      throw new Error("getMerkleTreeData returned undefined");
    } else if (result.error) {
      throw new Error(`getMerkleTreeData failed: ${result.error}`);
    }

    const { root, pathElements, pathIndices } = result;
    console.log({ root });
    const rootBytes = "0x" + BigInt(root as string).toString(16);
    console.log({ rootBytes });

    try {
      console.log("entering try block for proof");

      const input = {
        root: root!.toString(),
        nullifierHash: hashX.toString(),
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

      const calldata = await snarkjs.groth16.exportSolidityCallData(
        proof,
        publicSignals,
      );

      console.log({ calldata });

      const pA = proof.pi_a.slice(0, 2);
      const pB = proof.pi_b.slice(0, 2);
      const pC = proof.pi_c.slice(0, 2);
      const pubSignals = publicSignals;

      console.log({ pA });

      const pAHex = pA.map((number) =>
        hexlify(zeroPadValue(toBeArray(BigInt(number)), 32)),
      );

      console.log({ pAHex });
      const pBHex = pB.map((row) => {
        return row
          .reverse()
          .map((column) =>
            hexlify(zeroPadValue(toBeArray(BigInt(column)), 32)),
          );
      });
      const pCHex = pC.map((number) =>
        hexlify(zeroPadValue(toBeArray(BigInt(number)), 32)),
      );
      const signalsHex = pubSignals.map((number) =>
        hexlify(zeroPadValue(toBeArray(BigInt(number)), 32)),
      );

      // ABI types matching verifier contract
      const types = ["uint256[2]", "uint256[2][2]", "uint256[2]", "uint256[2]"];

      // Encode into byte array
      const encodedProof = AbiCoder.defaultAbiCoder().encode(types, [
        pAHex,
        pBHex,
        pCHex,
        signalsHex,
      ]);

      console.log({ encodedProof });

      const decodedProof = AbiCoder.defaultAbiCoder().decode(
        types,
        encodedProof,
      );

      console.log({ decodedProof });

      console.log({ proof, publicSignals });

      setResponse(encodedProof);

      setIsGenerateLoading(false);
    } catch (error) {
      console.error("Error generating proof:", error);
      setIsGenerateLoading(false);
    }

    async function getMerkleTreeData(contractAddress: string) {
      const contract: Contract = new Contract(
        contractAddress,
        contract_object!.abi,
        networks![2].provider,
        // currently set to Sepolia
      );

      console.log("Checkpoint, parsing logs from contract: ", {
        contractAddress,
      });

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
          (e) =>
            e!.args.commitment ===
            hexlify(zeroPadValue(toBeArray(BigInt(commitment)), 32)),
        );

        console.log("depositEvent", depositEvent);

        const tree = new MerkleTree(MERKLE_TREE_HEIGHT, leaves, {
          hashFunction: mimcHasher,
          zeroElement:
            "21663839004416932945382355908790599225266501822907911457504978515578255421292",
        });

        // const tree = new MerkleTree(MERKLE_TREE_HEIGHT, leaves);

        const leafIndex: number = depositEvent
          ? Number(depositEvent.args[1])
          : -1;

        if (leafIndex == -1) {
          toast({
            title: "Merkle Tree Error",
            description: "Commitment not found in tree",
            variant: "destructive",
          });
          return;
        }

        console.log({ leafIndex });

        const { pathElements, pathIndices } = tree.path(leafIndex);
        const treelen = tree.elements.length;
        const root = tree.root;

        console.log({
          tree,
          treelen,
          pathElements,
          pathIndices,
          root,
        });

        const rootBytes = hexlify(zeroPadValue(toBeArray(BigInt(root)), 32));

        const rootIndex = await contract.currentRootIndex();
        const lastRoot = await contract.getLastRoot();
        const rootCheck = await contract.isKnownRoot(rootBytes);
        const zeroRoot = await contract.roots(0);

        console.log({ rootIndex, lastRoot, rootCheck, rootBytes, zeroRoot });

        return {
          root,
          pathElements,
          pathIndices,
        };
      } catch (error) {
        console.log(error);
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
                  <FormLabel>Proving Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter PrivateKey" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={GenerateForm.control}
              name="contractAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>zero knowledge snark Contract Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter address for contract you deposited to"
                      {...field}
                    />
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
            <br />
            <div>
              <div>READ CAREFULLY: how to use your proof</div>
              <div>
                There are two ways to use this proof in order to withdraw your
                funds:
              </div>
              <div>OPTION 0</div>
              <div>
                Calling smart contract functions requires paying a small amount
                of ethereum to the network, otherwise known as a gas fee. If you
                have funds in another wallet to pay the gas fees to cover the
                WITHDRAW function call from the ZK deposit withdraw contract, go
                ahead and paste this proof into the WITHDRAW function using the
                wallet you used.{" "}
                <span className="text-red-500">
                  Make sure that the wallet you are withdrawing to has never
                  interacted with the wallet you deposited from!{" "}
                </span>
              </div>
              <div>OPTION 1</div>
              <div>
                If you dont have another secure ethereum wallet that can pay for
                the gas fees to withdraw your funds from the contract. You will
                need to use the{" "}
                <span className="text-violet-500">zk withdrawal agent</span>{" "}
                from the encryption tools menu. Using it is easy. Paste your
                proof and the address to your empty ethereum wallet that you are
                sending the funds to into the agents interface. The agent will
                send a smart contract function call on your behalf from a secure
                AWS lambda function and pay for the gas fees. 0xlibrary makes it
                easy to generate and manage multiple wallets from within the
                client.
              </div>
            </div>
          </div>
        )}
        <br />
        <Separator />
      </div>
    </div>
  );
}
