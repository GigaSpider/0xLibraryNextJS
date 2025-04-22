import { utils } from "ffjavascript";
import { buildPedersenHash, buildBabyjub } from "circomlibjs";
import { Contract, Interface, Log, isAddress } from "ethers";
import { randomBytes } from "crypto";
import { MerkleTree } from "fixed-merkle-tree";
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

interface Groth16Proof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: string;
  curve: string;
}

const formSchema = z.object({
  commitment: z.string(),
  destination: z.string(),
});

type RelayForm = z.infer<typeof formSchema>;

const MERKLE_TREE_HEIGHT = 32;

export default function Relayer() {
  const { contracts } = useContractStore();
  const { providers } = useWalletStore();

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
      commitment: "",
      destination: "",
    },
  });

  async function onRelaySubmit(data: RelayForm) {
    console.log(data);

    const { commitment, destination } = data;

    const pedersen = await buildPedersenHash();
    const babyJubs = await buildBabyjub();

    const pedersenHash = (data) => {
      return babyJubs.unpackPoint(pedersen.hash(data))[0];
    };

    const toHex = (number, length = 32) =>
      "0x" +
      (number instanceof Buffer
        ? number.toString("hex")
        : BigInt(number).toString(16)
      ).padStart(length * 2, "0");

    const recipient = isAddress(destination) ? destination : null;

    if (!commitment || !isAddress(destination)) return;

    // Generate necessary values
    const buf = Buffer.from(commitment, "hex");

    const nullifier = utils.leBuff2int(buf.slice(0, 31));
    const secret = utils.leBuff2int(buf.slice(31, 62));

    // First get merkle tree data
    const { pathElements, pathIndices, root } =
      await getMerkleTreeData(commitment);

    // Calculate nullifier hash
    const nullifierHash = pedersenHash(utils.leInt2Buff(nullifier, 31));

    // Generate proof
    const proof: Groth16Proof = await generateProof({
      root,
      nullifierHash,
      recipient,
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
      (e) => e.args.commitment === toHex(commitment),
    );

    const leafIndex = depositEvent ? depositEvent.args.leafIndex : -1;

    const tree = new MerkleTree(MERKLE_TREE_HEIGHT, leaves);

    const { pathElements, pathIndices } = tree.path(leafIndex);

    const root = tree.root;

    return { pathElements, pathIndices, root };
  }

  async function generateProof(input_parameters) {
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input_parameters,
      "./withdraw.wasm",
      "./withdraw_final.zkey",
    );

    console.log(proof, publicSignals);

    return proof;
  }

  return (
    <div className="flex flex-col h-full">
      <Form {...RelayForm}>
        <form
          onSubmit={RelayForm.handleSubmit(onRelaySubmit)}
          className="space-y-4"
        >
          <FormField
            control={RelayForm.control}
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
