import { useContractStore } from "@/hooks/store/contractStore";
import { useWalletStore } from "@/hooks/store/walletStore";
import { useInitializeContract } from "@/hooks/initializeContract";
import { Button } from "@/components/ui/button";

export default function NonProxyInterface() {
  const { SELECTED_CONTRACT } = useContractStore();
  const { providers } = useWalletStore();
  const { signContract } = useInitializeContract();

  return (
    <div>
      <div className="text-violet-500">{SELECTED_CONTRACT?.name}</div>
      <br />
      <div>Address: {SELECTED_CONTRACT?.address}</div>
      <br />
      <div>Description: {SELECTED_CONTRACT?.description}</div>
      <br />
      {providers ? (
        <>Providers provided</>
      ) : (
        <Button
          variant="outline"
          onClick={() => {
            console.log("signing with metamask");
            signContract();
          }}
        >
          Sign to initialize
        </Button>
      )}
    </div>
  );
}
