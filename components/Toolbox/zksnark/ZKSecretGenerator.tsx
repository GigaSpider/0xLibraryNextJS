"use client";

import { utils } from "ffjavascript";
import { randomBytes } from "crypto";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { CopyIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { buildBabyjub, buildPedersenHash } from "circomlibjs";
import { hexlify, toBeArray, zeroPadValue } from "ethers";

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

    const x = utils.leBuff2int(randomBytes(31));
    const y = utils.leBuff2int(randomBytes(31));

    const hashX = await pedersen(utils.leInt2Buff(x));
    const buff = Buffer.concat([
      utils.leInt2Buff(x, 31),
      utils.leInt2Buff(y, 31),
    ]);
    const commitment = await pedersen(buff);

    const commitmentEncoded = hexlify(zeroPadValue(toBeArray(commitment), 32));

    const privateKeyBuffer = Buffer.concat([
      utils.leInt2Buff(x, 31),
      utils.leInt2Buff(y, 31),
      utils.leInt2Buff(BigInt(hashX), 32),
      utils.leInt2Buff(BigInt(commitment), 32),
    ]);

    const privateKeyEncoded = hexlify(zeroPadValue(privateKeyBuffer, 126));

    const output = {
      x,
      y,
      hashX,
      commitment,
      commitmentEncoded,
      privateKeyEncoded,
    };

    console.log("Output:", output);
    setSecrets(output);
    setIsGenerateLoading(false);
    return output;
  }

  // Function to download keys as a text file
  const downloadKeys = () => {
    if (!secrets) {
      toast({
        description: "No keys available to download. Generate secrets first.",
        duration: 2000,
        variant: "destructive",
      });
      return;
    }

    // Format the content for the text file
    const content = `Zero Knowledge Keys
==================
WARNING: Do not share your Proving Key (privateKeyEncoded) with anyone. Keep it secure!

Public Deposit Identifier: ${secrets.commitmentEncoded}
Proving Key (Private): ${secrets.privateKeyEncoded}

Instructions:
1. Use the Public Deposit Identifier when calling the deposit function on the Zero Knowledge Deposit and Withdraw contract.
2. Use the Proving Key with the contract address in the ZK Proving tool to generate a proof for anonymous withdrawal.
`;

    // Create and download the text file
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `zk_keys_${new Date().toISOString().slice(0, 10)}.txt`; // Unique filename with date
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full m-2">
      <CardTitle className="text-green-400">
        Zero-Knowledge Succint Non-interactive Arguement of Knowledge — Key
        Generation Tool
      </CardTitle>
      <br />
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
                Public Deposit Identifier:{" "}
                {secrets["commitmentEncoded"].toString()}
              </span>
            </div>
            <br />
            <div className="flex items-center gap-2 whitespace-pre-wrap break-all font-mono">
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
                Proving Key (Do not share):{" "}
                {secrets["privateKeyEncoded"].toString()}
              </span>
            </div>
            <br />
            <br />
            <Button
              variant="secondary"
              size="sm"
              className="h-6 px-2 text-xs text-cyan-300"
              onClick={downloadKeys}
              disabled={!secrets} // Disable if no keys
            >
              Download Keys
            </Button>
            <br />
            <br />
            <div>
              I.
              <div>
                Use your Public Deposit Identifier when calling the deposit
                function on which ever of the Zero Knowledge Deposit and
                Withdraw contracts that fits your denomination requirements.
              </div>
            </div>
            <br />
            <div>
              II.
              <div>
                After making your deposit, use your proving key and the address
                of the contract you deposited to in the next step of the
                process, in the ZK Proving tool in order to generate the proof
                that will allow you to withdraw your funds anonymously
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
