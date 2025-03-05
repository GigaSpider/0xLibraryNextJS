import { useContractStore } from "@/hooks/store/contractStore";
import { useWalletStore } from "@/hooks/store/walletStore";
import { Contract, Wallet } from "ethers";
// import { useInitializeContract } from "@/hooks/initializeContract";
import { Button } from "@/components/ui/button";

export default function NonProxyInterface() {
  const { SELECTED_CONTRACT, set_INITIALIZED_CONTRACT, INITIALIZED_CONTRACT } =
    useContractStore();
  const { providers, private_key } = useWalletStore();

  async function handleInitialization() {
    let network_index;
    switch (SELECTED_CONTRACT?.network) {
      case "Mainnet":
        network_index = 0;
        break;
      case "Optimism":
        network_index = 1;
        break;
      case "Arbitrum":
        network_index = 2;
        break;
      default:
        network_index = 0;
        break;
    }

    const provider = providers![network_index];

    const wallet = new Wallet(private_key!, provider);

    const initialized = new Contract(
      SELECTED_CONTRACT!.address,
      SELECTED_CONTRACT!.abi,
      wallet,
    );

    set_INITIALIZED_CONTRACT(initialized);
  }

  return (
    <div>
      <div className="text-violet-500">{SELECTED_CONTRACT?.name}</div>
      <br />
      <div>Address: {SELECTED_CONTRACT?.address}</div>
      <br />
      <div>Description: {SELECTED_CONTRACT?.description}</div>
      <br />
      <div>{SELECTED_CONTRACT?.instructions}</div>
      <br />
      <div>Deposits and withdraws with {SELECTED_CONTRACT?.network} wallet</div>
      <br />
      {INITIALIZED_CONTRACT ? (
        <div className="text-green-500">
          Contract Signed, awaiting user actions
        </div>
      ) : (
        <Button onClick={() => handleInitialization()}>Sign</Button>
      )}
    </div>
  );
}
