import { useContractStore as ContractStore } from "@/hooks/store/contractStore";
import { useSwapStore as SwapStore } from "@/hooks/store/zustand";
import { useMetaMask as MetaMask } from "@/hooks/useMetaMask";
import { Interface, Contract, Log, Result } from "ethers";

export async function deployProxyContract(data: unknown) {
  const { SELECTED_CONTRACT, set_INITIALIZED_CONTRACT } = ContractStore();
  const { provider, signer, update_provider, update_signer } = SwapStore();
  const { connect } = MetaMask();

  if (!provider) {
    const { provider, signer } = await connect();
    update_provider(provider);
    update_signer(signer);
  }

  console.log("provider: ", provider);
  console.log("signer: ", signer);

  if (!provider || !signer) {
    throw new Error("Provider or signer not available");
  }

  const master_address = SELECTED_CONTRACT?.master_address;
  const proxy_abi = SELECTED_CONTRACT?.abi;
  const master_abi = SELECTED_CONTRACT?.master_abi;
  const function_name = SELECTED_CONTRACT?.function_name;

  const master_contract = new Contract(master_address!, master_abi!, signer);

  const contract_function = master_contract[function_name!];

  const tx = await contract_function(data);

  const receipt = await tx.wait();

  const iface = new Interface(master_abi);

  let returnArgs: Result[] = [];

  let proxy_address: string = "";

  receipt.logs.forEach((log: Log) => {
    try {
      const parsed = iface.parseLog(log)!;

      if (parsed.name === "ProxyContractCreation") {
        proxy_address = parsed.args.ProxyAddress;
        returnArgs = [...parsed.args];
      }
    } catch (error) {
      console.log(error);
    }
  });

  const proxy_contract: Contract = new Contract(
    proxy_address,
    proxy_abi,
    signer,
  );

  set_INITIALIZED_CONTRACT(proxy_contract);

  return returnArgs;
}

export async function connectProxyContract(contractAddress: string) {
  const { SELECTED_CONTRACT, set_INITIALIZED_CONTRACT } = ContractStore();
  const { provider, signer, update_provider, update_signer } = SwapStore();
  const { connect } = MetaMask();

  if (!provider) {
    const { provider, signer } = await connect();
    update_provider(provider);
    update_signer(signer);
  }

  console.log("provider: ", provider);
  console.log("signer: ", signer);

  if (!provider || !signer) {
    throw new Error("Provider or signer not available");
  }

  const master_address = SELECTED_CONTRACT?.master_address;
  const proxy_abi = SELECTED_CONTRACT?.abi;
  const master_abi = SELECTED_CONTRACT?.master_abi;
  const mapping_name = SELECTED_CONTRACT?.mapping_name;
  const signer_address = signer.getAddress();

  const master_contract = new Contract(master_address!, master_abi!, signer);

  const mapping = master_contract[mapping_name!];

  try {
    if ((await mapping(contractAddress)) == signer_address) {
      const proxy_contract = new Contract(contractAddress, proxy_abi, signer);
      set_INITIALIZED_CONTRACT(proxy_contract);
    } else {
      console.log("failed to connect to proxy contract.");
    }
  } catch (error) {
    console.log(error);
  }
}

export async function signContract() {
  const { SELECTED_CONTRACT, set_INITIALIZED_CONTRACT } = ContractStore();
  const { provider, signer, update_provider, update_signer } = SwapStore();
  const { connect } = MetaMask();

  if (!provider) {
    const { provider, signer } = await connect();
    update_provider(provider);
    update_signer(signer);
  }

  const contract = new Contract(
    SELECTED_CONTRACT!.address,
    SELECTED_CONTRACT!.abi,
    signer,
  );

  set_INITIALIZED_CONTRACT(contract);
}
