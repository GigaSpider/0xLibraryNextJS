import { useContractStore } from "@/hooks/store/contractStore";
import ProxyInterface from "./ProxyInterface";
// import ProxyDisplay from "./ProxyDisplay";
import NonProxyInterface from "./NonProxyInterface";

export default function InitializationMenu() {
  const { SELECTED_CONTRACT } = useContractStore();
  return (
    <div className="h-full w-full">
      {SELECTED_CONTRACT?.proxy ? <ProxyInterface /> : <NonProxyInterface />}
    </div>
  );
}
