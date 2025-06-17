import { useContractStore } from "@/hooks/store/contractStore";
import { useWalletStore } from "@/hooks/store/walletStore";
import { Contract, Wallet } from "ethers";
// import { useInitializeContract } from "@/hooks/initializeContract";
import { Button } from "@/components/ui/button";

export default function NonProxyInterface() {
  const { SELECTED_CONTRACT, set_INITIALIZED_CONTRACT, INITIALIZED_CONTRACT } =
    useContractStore();
  // const offchain_software = SELECTED_CONTRACT?.offchain_software;
  const { networks, wallet } = useWalletStore();

  async function handleInitialization() {
    let network_index;
    switch (SELECTED_CONTRACT?.network) {
      case "Mainnet":
        network_index = 0;
        break;
      case "Optimism":
        network_index = 1;
        break;
      case "Sepolia":
        network_index = 2;
        break;
      default:
        network_index = 0;
        break;
    }

    const walletObject = new Wallet(
      wallet!.private_key,
      networks[network_index].provider,
    );

    const initialized = new Contract(
      SELECTED_CONTRACT!.address,
      SELECTED_CONTRACT!.abi,
      walletObject,
    );

    set_INITIALIZED_CONTRACT(initialized);
  }

  return (
    <div className="text-gray-500">
      {" "}
      {}
      <div>{SELECTED_CONTRACT?.name}</div>
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
        <Button onClick={() => handleInitialization()}>Agree and Sign</Button>
      )}
    </div>
  );
}
