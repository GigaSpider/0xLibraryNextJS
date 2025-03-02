import { useContractStore as ContractStore } from "@/hooks/store/contractStore";
import { useSwapStore as SwapStore } from "@/hooks/store/zustand";
import { useWalletStore } from "./store/walletStore";
import { Interface, Contract, Log, Result, Wallet } from "ethers";

export function useInitializeContract() {
  const { SELECTED_CONTRACT, set_INITIALIZED_CONTRACT } = ContractStore();
  const { provider, signer, update_provider, update_signer } = SwapStore();
  const { private_key, providers, wallet } = useWalletStore();

  const deployProxyContract = async (data: unknown): Promise<Result[]> => {
    if (!providers || !wallet) {
      throw new Error("providers or wallet not available");
    }

    let network: number;
    switch (SELECTED_CONTRACT?.network) {
      case "Mainnet":
        network = 0;
        break;
      case "Optimism":
        network = 1;
        break;
      case "Arbitrum":
        network = 2;
        break;
      default:
        network = 0;
    }

    const local_wallet = new Wallet(private_key!, providers![network]);

    const master_address = SELECTED_CONTRACT?.master_address;
    const proxy_abi = SELECTED_CONTRACT?.abi;
    const master_abi = SELECTED_CONTRACT?.master_abi;
    const function_name = SELECTED_CONTRACT?.function_name;

    const master_contract = new Contract(
      master_address!,
      master_abi as any,
      local_wallet,
    );
    const tx = await master_contract[function_name!](data);
    const receipt = await tx.wait();

    const iface = new Interface(master_abi as any);
    let returnArgs: Result[] = [];
    let proxy_address: string = "";

    receipt.logs.forEach((log: Log) => {
      try {
        const parsed = iface.parseLog(log);
        if (parsed && parsed.name === "ProxyContractCreation") {
          proxy_address = parsed.args.ProxyAddress;
          returnArgs = [...parsed.args];
        } else {
          proxy_address = "error";
        }
      } catch (error) {
        console.log("Error parsing log:", error);
      }
    });

    const proxy_contract = new Contract(
      proxy_address,
      proxy_abi as any,
      local_wallet,
    );
    set_INITIALIZED_CONTRACT(proxy_contract);

    return returnArgs;
  };

  const connectProxyContract = async (
    contractAddress: string,
  ): Promise<void> => {
    let network: number;
    switch (SELECTED_CONTRACT?.network) {
      case "Mainnet":
        network = 0;
        break;
      case "Optimism":
        network = 1;
        break;
      case "Arbitrum":
        network = 2;
        break;
      default:
        network = 0;
    }

    const local_wallet = new Wallet(private_key!, providers![network]);

    const master_address = SELECTED_CONTRACT?.master_address;
    const proxy_abi = SELECTED_CONTRACT?.abi;
    const master_abi = SELECTED_CONTRACT?.master_abi;
    const mapping_name = SELECTED_CONTRACT?.mapping_name;

    const master_contract = new Contract(
      master_address!,
      master_abi as any,
      local_wallet,
    );

    const mapping = master_contract[mapping_name!];

    try {
      if ((await mapping(contractAddress)) === wallet!.address) {
        const proxy_contract = new Contract(
          contractAddress,
          proxy_abi as any,
          local_wallet,
        );
        set_INITIALIZED_CONTRACT(proxy_contract);
      } else {
        console.log("Failed to connect to proxy contract.");
      }
    } catch (error) {
      console.log("Error connecting proxy contract:", error);
    }
  };

  return { deployProxyContract, connectProxyContract };
}
