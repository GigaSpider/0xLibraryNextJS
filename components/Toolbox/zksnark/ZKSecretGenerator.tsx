import { utils } from "ffjavascript";
// import { toBigInt, toBeHex, BigNumberish } from "ethers";
import { buildPedersenHash, buildBabyjub } from "circomlibjs";
import bigInt from "big-integer";
import { randomBytes } from "crypto";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ZKProofGenerator from "./ZKProofGenerator";
import Relayer from "./Relayer";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function bigInt2BytesLE(_a: bigint, len: number) {
  const b = Array(len);
  let v = bigInt(_a);
  for (let i = 0; i < len; i++) {
    b[i] = v.and(0xff).toJSNumber();
    v = v.shiftRight(8);
  }
  return b;
}

export default function ZKSecretGenerator() {
  const [secrets, setSecrets] = useState<{
    [key: string]: string | Buffer | Buffer<ArrayBufferLike> | bigint;
  } | null>(null);
  const { toast } = useToast();

  async function handleGenerateSecrets() {
    const pedersen = await buildPedersenHash();
    const babyJub = await buildBabyjub();

    const rbigint = (nbytes: number) => utils.leBuff2int(randomBytes(nbytes));

    const pedersenHash = (data: string | Buffer<ArrayBufferLike>) => {
      return babyJub.unpackPoint(pedersen.hash(data))[0];
    };

    const nullifier = rbigint(31);
    const secret = rbigint(31);

    const preimage = Buffer.concat([
      utils.leInt2Buff(nullifier, 31),
      utils.leInt2Buff(secret, 31),
    ]);

    const preimageEncoded = "0x" + preimage.toString("hex");
    const commitment = pedersenHash(preimage);
    const bufferCommitment = Buffer.from(commitment);
    const commitmentEncoded = "0x" + bufferCommitment.toString("hex");

    // const nullifierBits = bigInt2BytesLE(nullifier, 31);
    // const nullifierHash1 = pedersenHash(nullifierBits);
    const nullifierHash2: bigint = utils.leBuff2int(
      Buffer.from(pedersenHash(utils.leInt2Buff(nullifier, 31))),
    );

    const reconstructedPreimage = Buffer.from(preimageEncoded.slice(2), "hex");
    const reconstructedCommitment = Buffer.from(
      commitmentEncoded.slice(2),
      "hex",
    );

    const reconstructedNullifier = utils.leBuff2int(preimage.subarray(0, 31));
    const reconstructedSecret = utils.leBuff2int(preimage.subarray(31));

    const output = {
      secret: secret,
      nullifier: nullifier,
      preimage: preimage,
      preimageEncoded: preimageEncoded,
      commitmentEncoded: commitmentEncoded,
      commitment: commitment,
      reconstructedPreimage: reconstructedPreimage,
      reconstructedCommitment: reconstructedCommitment,
      nullifierHash2: nullifierHash2,
      reconstructedNullifier: reconstructedNullifier,
      reconstructedSecret: reconstructedSecret,
    };

    console.log(output);

    setSecrets(output);
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
              {Object.entries(secrets).map(([key, value]) => {
                return (
                  <div key={key}>
                    {key}: {value}
                  </div>
                );
              })}
              <br />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      secrets["commitmentEncoded"].toString(),
                    );
                    toast({
                      description: "Commitment copied to clipboard",
                      duration: 2000,
                    });
                  }}
                >
                  <CopyIcon className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <span>
                  Commitment: {secrets["commitmentEncoded"].toString()}
                </span>
              </div>
              <br />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      secrets["preimageEncoded"].toString(),
                    );
                    toast({
                      description: "Preimage copied to clipboard",
                      duration: 2000,
                    });
                  }}
                >
                  <CopyIcon className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <span>
                  Secret (Do not share): {secrets["preimageEncoded"].toString()}
                </span>
              </div>
              <br />
              <br />
              <Button
                variant="secondary"
                size="sm"
                className="h-6 px-2 text-xs text-green-400"
              >
                Download Secrets
              </Button>
              <br />
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
