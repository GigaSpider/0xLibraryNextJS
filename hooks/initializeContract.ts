import { useContractStore as ContractStore } from "@/hooks/store/contractStore";
import { useWalletStore } from "./store/walletStore";
import { Interface, Contract, Log, Result, Wallet } from "ethers";
import { useToast } from "./use-toast";

export function useInitializeContract() {
  const { SELECTED_CONTRACT, set_INITIALIZED_CONTRACT } = ContractStore();
  const { private_key, providers, wallet } = useWalletStore();
  const { toast } = useToast();

  const deployProxyContract = async (
    data: unknown,
  ): Promise<Result[] | Error> => {
    if (!providers || !private_key) {
      throw new Error("providers or wallet not available");
    }

    let network_index: number;
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
    }

    const wallet = new Wallet(private_key!, providers![network_index]);

    const master_address = SELECTED_CONTRACT?.master_address;
    const proxy_abi = SELECTED_CONTRACT?.abi;
    const master_abi = SELECTED_CONTRACT?.master_abi;
    const function_name = SELECTED_CONTRACT?.function_name;
    const event_name = SELECTED_CONTRACT?.event_name;

    const master_contract = new Contract(
      master_address!,
      master_abi as any,
      wallet,
    );

    console.log("checkpoint, calling deploy proxy function on blockchain");

    const iface = new Interface(master_abi as any);

    const deployFunction = iface.getFunction(function_name!);
    if (!deployFunction) {
      throw new Error("Function not found in abi");
    }

    console.log(data);

    console.log(deployFunction);

    try {
      const tx = await master_contract[deployFunction.format()](
        ...Object.values(data as any),
      );
      const receipt = await tx.wait();

      let returnArgs: Result[] = [];
      let proxy_address: string = "";

      receipt.logs.forEach((log: Log) => {
        try {
          const parsed = iface.parseLog(log);
          if (parsed && parsed.name === event_name) {
            proxy_address = parsed.args[0];
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
        wallet,
      );
      set_INITIALIZED_CONTRACT(proxy_contract);

      return returnArgs;
    } catch (error: any) {
      if (error.code === "INSUFFICIENT_FUNDS") {
        toast({
          title: "PROXY DEPLOYMENT ERROR",
          description: "Insufficient Funds.",
          variant: "destructive",
        });
      }
      console.log(error);
      return error as Error;
    }
  };

  const connectProxyContract = async (
    address: string,
  ): Promise<Contract | Error> => {
    console.log(address);
    let network_index: number;
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
        return Error("Invalid network");
    }

    try {
      const wallet = new Wallet(private_key!, providers![network_index]);

      const master_contract = new Contract(
        SELECTED_CONTRACT?.master_address!,
        SELECTED_CONTRACT?.master_abi as any,
        wallet,
      );

      // Add verification that mapping exists
      if (!SELECTED_CONTRACT?.mapping_name) {
        return Error("Mapping function name not specified");
      }

      try {
        const result =
          await master_contract[SELECTED_CONTRACT.mapping_name](address);

        if (result === wallet.address) {
          const proxy_contract = new Contract(
            address,
            SELECTED_CONTRACT?.abi as any,
            wallet,
          );
          set_INITIALIZED_CONTRACT(proxy_contract);
          return proxy_contract;
        } else {
          return Error(
            "Contract not owned by this address, interaction prohibited",
          );
        }
      } catch (error: any) {
        if (error.code === "BAD_DATA") {
          return Error("Contract not found in mapping");
        }
        return error;
      }
    } catch (error) {
      console.log("Error connecting proxy contract:", error);
      return error as Error;
    }
  };

  return { deployProxyContract, connectProxyContract };
}
