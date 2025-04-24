import { Scalar, utils } from "ffjavascript";
import { utils as web3utils } from "web3";
import { toBigInt, toBeHex, BigNumberish } from "ethers";
import { buildPedersenHash, buildBabyjub } from "circomlibjs";
import { randomBytes } from "crypto";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ZKProofGenerator from "./ZKProofGenerator";
import Relayer from "./Relayer";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Redo, RedoIcon } from "lucide-react";

export default function ZKSecretGenerator() {
  const [secrets, setSecrets] = useState<{
    [key: string]: bigint | Buffer<ArrayBuffer> | string;
  } | null>(null);

  async function handleGenerateSecrets() {
    const pedersen = await buildPedersenHash();
    const babyJub = await buildBabyjub();

    const rbigint = (nbytes: number) => utils.leBuff2int(randomBytes(nbytes));

    const pedersenHash = (data) => {
      return babyJub.unpackPoint(pedersen.hash(data))[0];
    };

    const secret = rbigint(31);
    const nullifier = rbigint(31);

    const preimage = Buffer.concat([
      utils.leInt2Buff(nullifier, 31),
      utils.leInt2Buff(secret, 31),
    ]);

    const preimageEncoded = "0x" + preimage.toString("hex");
    const commitment = pedersenHash(preimage);
    const commitmentBuffer = Buffer.from(commitment);
    const commitmentEncoded = commitment.toString("base64");
    const nullifierHash = pedersenHash(utils.leInt2Buff(nullifier, 31));

    const reconstructed_nullifier = utils.leBuff2int(preimage.subarray(0, 31));
    const reconstructed_secret = utils.leBuff2int(preimage.subarray(31));

    const output = {
      secret: secret,
      nullifier: nullifier,
      preimage: preimageEncoded,
      commitment: commitmentEncoded,
      nullifierHash: nullifierHash,
      reconstructed_nullifier: reconstructed_nullifier,
      reconstructed_secret: reconstructed_secret,
    };

    console.log(output);

    setSecrets({ preimage: preimageEncoded, commitment: commitmentEncoded });
    return output;
  }

  return (
    <div className="flex flex-col h-full text-xs text-green-400">
      <ScrollArea className="flex overflow-y-auto m-2">
        <div>
          <Button
            onClick={handleGenerateSecrets}
            variant="secondary"
            className="text-xs"
          >
            Generate Secrets
          </Button>
          <br />
          <br />
        </div>
        <div>
          {secrets && (
            <>
              <div>Preimage: {secrets["preimage"]}</div>
              <br />
              <div>Commitment: {secrets["commitment"]}</div>
              <br />
              <div>
                Use the Commitment in the parameter field when calling the
                Deposit function on the ZK contract. After you have made your
                deposit and waited an appropriate amount of time, proceed to
                generate the proof that allows you to withdraw your funds
                anonymously
              </div>
              <br />

              <Tabs defaultValue="account" className="w-[500px]">
                <TabsList>
                  <TabsTrigger value="manual">
                    Prove Manually (No Fee)
                  </TabsTrigger>
                  <TabsTrigger value="relayer">
                    Use Relayer (.25% Fee)
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="manual">
                  <ZKProofGenerator />
                </TabsContent>
                <TabsContent value="relayer">
                  <Relayer />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
