import { EventFragment } from "ethers";
import { useContractStore } from "./store/contractStore";

export function useEventListener() {
  const { INITIALIZED_CONTRACT } = useContractStore();

  const events: EventFragment[] =
    INITIALIZED_CONTRACT?.interface.fragments.filter(
      (fragment): fragment is EventFragment => fragment.type === "event",
    ) || [];

  events.forEach((event) => {
    console.log(event);
  });
}
