import { randomBytes, keccak256, hexlify } from "ethers";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ZKSecretGenerator() {
  const [secrets, setSecrets] = useState<{ [key: string]: string } | null>(
    null,
  );

  async function handleGenerateSecrets() {
    // Convert random bytes to hex strings
    const secret1 = hexlify(randomBytes(32));
    const secret2 = hexlify(randomBytes(32));

    // Concatenate the hex strings properly
    const concatenatedSecrets = secret1 + secret2.slice(2); // Remove '0x' from second secret
    const hash: string = keccak256(concatenatedSecrets);
    const nullifier: string = keccak256(secret1);

    const output = {
      "secret 1": secret1,
      "secret 2": secret2,
      hash: hash,
      nullifier: nullifier,
    };

    setSecrets(output);
    return output;
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex overflow-y-auto m-2">
        <div>
          <Button onClick={handleGenerateSecrets}>Generate Secrets</Button>
        </div>
        <div>
          {secrets && (
            <>
              <div>Secret 1: {secrets["secret 1"]}</div>
              <div>Secret 2: {secrets["secret 2"]}</div>
              <div>Hash: {secrets.hash}</div>
              <div>Nullifier: {secrets.nullifier}</div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
