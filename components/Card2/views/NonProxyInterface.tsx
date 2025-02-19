import { useContractStore } from "@/hooks/store/contractStore";
import { useSwapStore } from "@/hooks/store/zustand";
import { signContract } from "@/lib/initializeContract";
import { Button } from "@/components/ui/button";

export default function NonProxyInterface() {
  const { SELECTED_CONTRACT } = useContractStore();
  const { signer } = useSwapStore();

  return (
    <div>
      <div className="text-violet-500">{SELECTED_CONTRACT?.name}</div>
      <br />
      <div>Address: {SELECTED_CONTRACT?.address}</div>
      <br />
      {signer ? (
        <>User signed already, proceed to interaction menu</>
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
