import { create } from "zustand";
import { Contract, TransactionReceipt } from "ethers";
import XMR_ETH from "./contractdata/XMR_ETH.json";
import ETH_XMR from "./contractdata/ETH_XMR.json";
import WAGER from "./contractdata/WAGER.json";
import MASTER from "./contractdata/MASTER.json";
import ETHZK from "./contractdata/ETHZK.json";

export enum NetworkIndex {
  "Mainnet" = 0,
  "Optimism" = 1,
  "Arbitrum" = 2,
  "Sepolia" = 3,
}

export type SmartContract = {
  id: number;
  name: string;
  address: string;
  engineer: string;
  network: string;
  proxy: boolean;
  abi: any;
  bytecode: string;
  fee: number;
  instructions: string;
  description: string;
  master_address?: string;
  master_abi?: any;
  function_name?: string;
  event_name?: string;
  mapping_name?: string;
};

const ethxmr: SmartContract = {
  id: 1,
  name: "Cross chain ETH/XMR Swap",
  address: "0x32c615C98E173d8e0D3cc98ee93fBD1734552449",
  engineer: "Admin",
  network: "Optimism",
  proxy: true,
  abi: ETH_XMR.abi,
  bytecode: ETH_XMR.bytecode,
  fee: 0.5,
  description: "Contract description",
  instructions: "Instructions on usage: ",
  master_address: "0x1f2272A0D42A6C34805908B9D28253a9C293ef3C",
  master_abi: MASTER.abi,
  function_name: "CreateEthXmrContract",
  event_name: "EthXmrContractCreation",
  mapping_name: "ETH_XMR_CONTRACTS",
};

const xmreth: SmartContract = {
  id: 2,
  name: "Cross chain XMR/ETH Swap",
  address: "0x715EE67c54BBa24A05f256aeDB4f6bb0AD2E06F3",
  engineer: "Admin",
  network: "Optimism",
  proxy: true,
  abi: XMR_ETH.abi,
  bytecode: XMR_ETH.bytecode,
  fee: 0.5,
  description: "Contract description",
  instructions: "Instructions on usage: ",
  master_address: "0xE56eFe07c2a6cd7C4d41B441c3DFeb5cbc7087eF",
  master_abi: MASTER.abi,
  function_name: "CreateXmrEthContract",
  event_name: "XmrEthContractCreation",
  mapping_name: "XMR_ETH_CONTRACTS",
};

const zksnark_01: SmartContract = {
  id: 3,
  name: "Zero Knowledge Obfuscation Deposit/Withdraw | Denomination: 0.01 ETH",
  address: "0xDE03E825d944e2Fce71761faE63e1F7719f1F632",
  engineer: "Admin",
  network: "Sepolia",
  proxy: false,
  abi: ETHZK.abi,
  bytecode: ETHZK.bytecode,
  fee: 0.1,
  description: "Zero Knowledge Snark Deposit and Withdrawal",
  instructions: "Instructions on usage: ",
};

const zksnark_05: SmartContract = {
  id: 4,
  name: "Zero Knowledge Obfuscation Deposit/Withdraw | Denomination: 0.05 ETH",
  address: "0xB7990562f05c9a5D6ee0D5F7c2ff90d20644cf4c",
  engineer: "Admin",
  network: "Sepolia",
  proxy: false,
  abi: ETHZK.abi,
  bytecode: ETHZK.bytecode,
  fee: 0.1,
  description: "Zero Knowledge Snark Deposit and Withdrawal",
  instructions: "Instructions on usage: ",
};

const zksnark_1: SmartContract = {
  id: 5,
  name: "Zero Knowledge Obfuscation Deposit/Withdraw | Denomination: 0.1 ETH",
  address: "0x52346736Ae0279f4219313AAE626F12bCc7DAFA3",
  engineer: "Admin",
  network: "Sepolia",
  proxy: false,
  abi: ETHZK.abi,
  bytecode: ETHZK.bytecode,
  fee: 0.1,
  description: "Zero Knowledge Snark Deposit and Withdrawal",
  instructions: "Instructions on usage: ",
};

const zksnark1_0: SmartContract = {
  id: 6,
  name: "Zero Knowledge Obfuscation Deposit/Withdraw | Denomination: 1.0 ETH",
  address: "0xFA8B3633C15b8a046E6060402a1A147da91fa92c",
  engineer: "Admin",
  network: "Sepolia",
  proxy: false,
  abi: ETHZK.abi,
  bytecode: ETHZK.bytecode,
  fee: 0.1,
  description: "Zero Knowledge Snark Deposit and Withdrawal",
  instructions: "Instructions on usage: ",
};

const gambler: SmartContract = {
  id: 7,
  name: "Variable Probability Donation",
  address: "0xE1B78225971d5c8957C749Dd18e56dadEC9e4016",
  engineer: "Admin",
  network: "Sepolia",
  proxy: false,
  abi: WAGER.abi,
  bytecode: WAGER.bytecode,
  fee: 1.0,
  description:
    "This contract is for donations only, if you send ethereum to this contract, you do so under the assumption that you will not get it back. However, depending on which odds you choose, you may get your donation back with substantial interest.",
  instructions:
    "Instructions on usage: This contract is set for a denomination of 0.01 ETH. You may adjust the odds within an inclusive range of 10 to 90, representing the odds of your donation being returned. The interest earned on a returned donation is inversely proportional to the odds you set, so an odds of 10 will return a donation of 1 ETH, and an odds of 90 will return a donation of 0.0111 ETH (with a 90% chance of victory. Since it isn't possible to provide true randomness on chain without the usage of extremely expensive chainlink VRF. Randomness is provided by the Library's own oracle network. For extra safety I have made it so, in the rare event that the oracle doesnt respond properly, or a freak error occurs, you may withdraw your funds after 5 minutes from when you made your donation",
};

const master: SmartContract = {
  id: 8,
  name: "Master (Admin use only)",
  address: "0xE56eFe07c2a6cd7C4d41B441c3DFeb5cbc7087eF",
  engineer: "Admin",
  network: "Optimism",
  proxy: false,
  abi: MASTER.abi,
  bytecode: MASTER.bytecode,
  fee: 0,
  description: "Contract description",
  instructions: "Instructions on usage: ",
};

export const contracts: SmartContract[] = [
  ethxmr,
  xmreth,
  zksnark_01,
  zksnark_05,
  zksnark_1,
  zksnark1_0,
  gambler,
  master,
];

type ContractStore = {
  contracts: SmartContract[];
  outputs: Record<string, TransactionReceipt[]> | null;
  add_output: (function_name: string, output: TransactionReceipt) => void;
  INITIALIZED_CONTRACT: Contract | null;
  SELECTED_CONTRACT: SmartContract | null;
  set_SELECTED_CONTRACT: (selected: SmartContract) => void;
  set_INITIALIZED_CONTRACT: (proxy: Contract | null) => void;
};

export const useContractStore = create<ContractStore>((set) => ({
  contracts: contracts,
  outputs: null,
  SELECTED_CONTRACT: null,
  INITIALIZED_CONTRACT: null,
  set_SELECTED_CONTRACT: (selected: SmartContract) =>
    set(() => ({ SELECTED_CONTRACT: selected })),
  set_INITIALIZED_CONTRACT: (proxy: Contract | null) =>
    set(() => ({ INITIALIZED_CONTRACT: proxy })),
  add_output: (function_name: string, output: TransactionReceipt) =>
    set((state) => {
      // Initialize outputs if null
      const currentOutputs = state.outputs || {};

      // Initialize array for this function if it doesn't exist
      const functionOutputs = currentOutputs[function_name] || [];

      // Create a new object with the updated array for this function
      return {
        outputs: {
          ...currentOutputs,
          [function_name]: [...functionOutputs, output],
        },
      };
    }),
}));
