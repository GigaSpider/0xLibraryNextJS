import { utils } from "ffjavascript";
import { buildPedersenHash, buildBabyjub } from "circomlibjs";
import { Contract, isAddress } from "ethers";
import { Element, MerkleTree } from "fixed-merkle-tree";
import { useContractStore } from "@/hooks/store/contractStore";
import { useWalletStore } from "@/hooks/store/walletStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormLabel,
  FormField,
  FormItem,
  FormControl,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Separator } from "@/components/ui/separator";
import * as snarkjs from "snarkjs";
// import { Toast } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

// interface Groth16Proof {
//   pi_a: string[];
//   pi_b: string[][];
//   pi_c: string[];
//   protocol: string;
//   curve: string;
// }

interface GrothInputParameters {
  root: Element;
  nullifierHash: bigint;
  recipient: string;
  fee: number;
  refund: string;
  nullifier: bigint;
  secret: bigint;
  pathElements: Element[];
  pathIndices: number[];
}

const formSchema = z.object({
  preimage: z.string().nonempty({ message: "Required" }),
  destination: z.string().nonempty({ message: "Required" }),
});

type RelayForm = z.infer<typeof formSchema>;

const MERKLE_TREE_HEIGHT = 32;

export default function Relayer() {
  const { toast } = useToast();
  const { contracts } = useContractStore();
  const { providers } = useWalletStore();

  let result;
  // Helper functions that need crypto libraries

  const contract = contracts[2];
  const provider = providers![1];

  const ethers_contract = new Contract(
    contract.address,
    contract.abi,
    provider,
  );

  const contract_interface = ethers_contract!.interface;

  const RelayForm = useForm<RelayForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preimage: "",
      destination: "",
    },
  });

  async function onRelaySubmit(data: RelayForm) {
    console.log(data);

    const { preimage, destination } = data;

    const pedersen = await buildPedersenHash();
    const babyJubs = await buildBabyjub();

    const pedersenHash = (data: string | Buffer<ArrayBufferLike>) => {
      return babyJubs.unpackPoint(pedersen.hash(data))[0];
    };

    if (!isAddress(destination)) {
      return; // Exit the function early
    }
    const recipient = destination;

    if (!preimage || !isAddress(destination)) return;

    const buf = Buffer.from(preimage);

    const commitment = pedersenHash(preimage);

    const secret = utils.leBuff2int(buf.subarray(0, 31));
    const nullifier = utils.leBuff2int(buf.subarray(31));

    const merkleTreeData = await getMerkleTreeData(commitment);

    if (!merkleTreeData) {
      console.error("failed to get merkle tree data");
      return;
    }

    const { pathElements, pathIndices, root } = merkleTreeData;

    const fee = 5;

    const refund = contract.address;

    const nullifierHash = BigInt(pedersenHash(utils.leInt2Buff(nullifier, 31)));

    const proof = await generateProof({
      root,
      nullifierHash,
      recipient,
      fee,
      refund,
      nullifier,
      secret,
      pathElements,
      pathIndices,
    });

    const body = {
      proof,
      root,
      nullifierHash,
      destination: recipient,
      contractAddress: contract!.address,
    };

    try {
      const response = await fetch("/api/relayer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      const hash = result.confirmation;
      console.log(hash);
    } catch (error) {
      console.log("Api call failed");
      console.error(error);
    }
  }

  async function getMerkleTreeData(commitment: string) {
    try {
      const event_logs = await ethers_contract.queryFilter(
        "DepositEvent",
        0,
        "latest",
      );

      const parsed_logs = event_logs
        .map((log) => {
          const parsed_log = contract_interface.parseLog(log);
          if (parsed_log) {
            return {
              ...log,
              name: parsed_log.name,
              args: parsed_log.args,
            };
          }
          return null;
        })
        .filter((log) => log !== null);

      const leaves = parsed_logs
        .sort((a, b) => a.args.leafIndex - b.args.leafIndex)
        .map((event) => event.args.commitment);

      const depositEvent = parsed_logs.find(
        (e) => e.args.commitment === commitment,
      );

      const leafIndex = depositEvent ? depositEvent.args.leafIndex : -1;

      const tree = new MerkleTree(MERKLE_TREE_HEIGHT, leaves);

      const { pathElements, pathIndices } = tree.path(leafIndex);

      const root = tree.root;

      return { pathElements, pathIndices, root };
    } catch (error) {
      toast({
        title: "Merkle Tree sError",
        variant: "destructive",
        description: "Failed to get Merkle Tree Data",
      });
      console.error(error);
      return;
    }
  }

  async function generateProof(input: GrothInputParameters) {
    try {
      const circuit_input = {
        root: input.root,
        nullifierHash: input.nullifierHash,
        recipient: input.recipient,
        relayer: contract.address,
        fee: input.fee,
        refund: input.refund,
        nullifier: input.nullifier,
        secret: input.secret,
        pathElements: input.pathElements,
        pathIndicies: input.pathIndices,
      };

      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        circuit_input,
        "./withdraw.wasm",
        "./withdraw_final.zkey",
      );

      console.log(proof, publicSignals);

      return proof;
    } catch (error) {
      toast({
        title: "Proof Error",
        variant: "destructive",
        description: "Failed to generate proof",
      });
      console.error(error);
      return;
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div>
        Using the relayer service abstracts away some of the security hurdles
        and allows you to withdraw ethereum to an empty wallet. If you would
        like to pay the gas fees yourself and deposit to a non empty wallet feel
        free to prove manually and interact with the contract directly
      </div>
      <br />
      <Form {...RelayForm}>
        <form
          onSubmit={RelayForm.handleSubmit(onRelaySubmit)}
          className="space-y-4"
        >
          <FormField
            control={RelayForm.control}
            name="preimage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preimage</FormLabel>
                <FormControl>
                  <Input placeholder="Enter preimage" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={RelayForm.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter destination" {...field} />
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
      {result && <div>{result}</div>}
    </div>
  );
}
