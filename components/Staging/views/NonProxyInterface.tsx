import { useContractStore } from "@/hooks/store/contractStore";
import { useWalletStore } from "@/hooks/store/walletStore";
import { Contract, Wallet } from "ethers";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CopyIcon } from "lucide-react";

export default function NonProxyInterface() {
  const { SELECTED_CONTRACT, set_INITIALIZED_CONTRACT, INITIALIZED_CONTRACT } =
    useContractStore();
  const [network, setNetwork] = useState("");
  const { wallet } = useWalletStore();

  async function handleInitialization() {
    switch (SELECTED_CONTRACT?.chainId) {
      case 1:
        setNetwork("main net");
        break;
      case 10:
        setNetwork("optimism");
        break;
      case 11155111:
        setNetwork("sepolia test net");
        break;
      default:
        setNetwork("unknown");
        break;
    }

    const walletObject = new Wallet(wallet!.private_key);

    const initialized = new Contract(
      SELECTED_CONTRACT!.address,
      SELECTED_CONTRACT!.abi,
      walletObject,
    );

    set_INITIALIZED_CONTRACT(initialized);
  }

  return (
    <ScrollArea className="text-gray-400 h-full">
      <div>{SELECTED_CONTRACT?.name}</div>
      <br />
      <div className="flex gap-2">
        Address: <span>{SELECTED_CONTRACT?.address}</span>
        <Separator orientation="vertical" />
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => {
            navigator.clipboard.writeText(SELECTED_CONTRACT!.address);
          }}
        >
          <CopyIcon className="h-3 w-3 mr-1" />
          Copy
        </Button>
      </div>
      <br />
      <div>Description: {SELECTED_CONTRACT?.description}</div>
      <br />
      <div>
        {SELECTED_CONTRACT?.instructions.split("\n").map((line, index) => (
          <p key={index} style={{ margin: "8px 0" }}>
            {line}
          </p>
        ))}
      </div>
      <br />
      <div>Deposits and withdraws with {network} wallet</div>
      <br />
      {INITIALIZED_CONTRACT ? (
        <div className="text-green-500">
          Contract Initialized, awaiting user actions
        </div>
      ) : (
        <Button onClick={() => handleInitialization()}>
          Initialize Contract
        </Button>
      )}
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
    </ScrollArea>
  );
}
