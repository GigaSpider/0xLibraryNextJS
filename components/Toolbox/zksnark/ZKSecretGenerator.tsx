"use client";

import { utils } from "ffjavascript";
import { randomBytes } from "crypto";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ZKProofGenerator from "./ZKProofGenerator";
import Relayer from "./Relayer";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { buildBabyjub, buildPedersenHash } from "circomlibjs";

async function pedersen(buff: Buffer) {
  const hasher = await buildPedersenHash();
  const babyJub = await buildBabyjub();
  const hashBytes = hasher.hash(buff);
  const unpack = babyJub.unpackPoint(hashBytes);
  const hash = babyJub.F.toString(unpack[0]);
  return BigInt(hash);
}

export default function ZKSecretGenerator() {
  const [isGenerateLoading, setIsGenerateLoading] = useState(false);
  const [secrets, setSecrets] = useState<{
    [key: string]: string | Buffer | Buffer<ArrayBufferLike> | bigint;
  } | null>(null);
  const { toast } = useToast();

  async function handleGenerateSecrets() {
    setIsGenerateLoading(true);
    // const jub = await buildBabyjub();

    const x = utils.leBuff2int(randomBytes(31));
    const y = utils.leBuff2int(randomBytes(31));

    // Hardcoded values for testing

    // const x = BigInt(
    //   "344410142378928871436301712867274033804306130921771574934151126616008408896",
    // );
    // const y = BigInt(
    //   "53388718127289800018449053091626962393684120531648523656289837560003367174",
    // );

    // Encode preimage and commitment for output

    const hashX = await pedersen(utils.leInt2Buff(x));
    const buff = Buffer.concat([
      utils.leInt2Buff(x, 31),
      utils.leInt2Buff(y, 31),
    ]);
    const commitment = await pedersen(buff);

    // let hashX;
    // let commitment;

    // try {
    //   const input = {
    //     nullifier: x.toString(),
    //     secret: y.toString(),
    //   };
    //   const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    //     input,
    //     "/pedersenhasher.wasm",
    //     "/pedersenhasher_0001.zkey",
    //   );

    //   hashX = publicSignals[0];
    //   commitment = publicSignals[1];

    //   console.log({ hashX, commitment });
    // } catch (error) {
    //   console.error(error);
    // }

    const commitmentEncoded =
      "0x" + BigInt(commitment).toString(16).padStart(32, "0");

    const privateKeyBuffer = Buffer.concat([
      utils.leInt2Buff(x, 31),
      utils.leInt2Buff(y, 31),
      utils.leInt2Buff(BigInt(hashX), 32),
      utils.leInt2Buff(BigInt(commitment), 32),
    ]);

    const privateKeyEncoded = "0x" + privateKeyBuffer.toString("hex");
    // Reconstruct for verification

    const output = {
      x: x,
      y: y,
      hashX: hashX,
      commitment: commitment,
      commitmentEncoded: commitmentEncoded,
      privateKeyEncoded: privateKeyEncoded,
    };

    console.log("Output:", output);
    setSecrets(output);
    setIsGenerateLoading(false);
    return output;
  }

  return (
    <div className="flex flex-col h-full text-xs text-green-400">
      <ScrollArea className="flex overflow-y-auto m-2">
        <div>
          <Button type="submit" onClick={handleGenerateSecrets}>
            {isGenerateLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Secrets"
            )}
          </Button>
          <br />
          <br />
        </div>
        <div>
          {secrets && (
            <>
              {/* {Object.entries(secrets).map(([key, value]) => {
                return (
                  <div key={key}>
                    {key}: {value}
                  </div>
                );
              })} */}
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
                  Public Key: {secrets["commitmentEncoded"].toString()}
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
                      secrets["privateKeyEncoded"].toString(),
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
                  Private Key (Do not share):{" "}
                  {secrets["privateKeyEncoded"].toString()}
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
