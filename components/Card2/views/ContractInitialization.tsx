"use client";

import InitializationMenu from "./InitializationMenu";
import { useContractStore } from "@/hooks/store/contractStore";

export default function ContractInitialization() {
  const { SELECTED_CONTRACT } = useContractStore();
  return <>{SELECTED_CONTRACT ? <InitializationMenu /> : <></>}</>;
}
