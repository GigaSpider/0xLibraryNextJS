import { useContractStore } from "@/hooks/store/contractStore";
import { Button } from "@/components/ui/button";

export default function ProxyDisplay() {
  const { INITIALIZED_CONTRACT, SELECTED_CONTRACT } = useContractStore();

  return (
    <div>
      <div>
        {SELECTED_CONTRACT!.name} deployed at address:{" "}
        {INITIALIZED_CONTRACT?.getAddress()}
      </div>
      <Button>View on Etherscan(not working)</Button>
    </div>
  );
}
