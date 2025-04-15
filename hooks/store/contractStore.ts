import { create } from "zustand";
import { Contract, TransactionReceipt } from "ethers";
import XMR_ETH from "./contractdata/XMR_ETH.json";
import ETH_XMR from "./contractdata/ETH_XMR.json";
import VariableProbabilityWager from "./contractdata/VariableProbabilityWager.json";
import MASTER from "./contractdata/MASTER.json";

export enum NetworkIndex {
  "Mainnet" = 0,
  "Optimism" = 1,
  "Arbitrum" = 2,
}

interface OffchainSoftware {
  name: string;
  files: {
    [filename: string]: {
      inputs: string[];
      outputs: string[];
      source: string;
    };
  };
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
  fee: 1.0,
  description: "Contract description",
  instructions: "Instructions on usage: ",
  master_address: "0xE56eFe07c2a6cd7C4d41B441c3DFeb5cbc7087eF",
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
  fee: 1.0,
  description: "Contract description",
  instructions: "Instructions on usage: ",
  master_address: "0xE56eFe07c2a6cd7C4d41B441c3DFeb5cbc7087eF",
  master_abi: MASTER.abi,
  function_name: "CreateXmrEthContract",
  event_name: "XmrEthContractCreation",
  mapping_name: "XMR_ETH_CONTRACTS",
};

const zksnark: SmartContract = {
  id: 3,
  name: "Zero Knowledge SNARK Deposit and Withdrawal",
  address: "not available yet",
  engineer: "Admin",
  network: "Optimism",
  proxy: false,
  abi: VariableProbabilityWager.abi,
  bytecode: VariableProbabilityWager.bytecode,
  fee: 0.1,
  description: "Contract description",
  instructions: "Instructions on usage: ",
};

const gambler: SmartContract = {
  id: 4,
  name: "Variable Probability Wager (Supports the website)",
  address: "not available yet",
  engineer: "Admin",
  network: "Optimism",
  proxy: false,
  abi: VariableProbabilityWager.abi,
  bytecode: VariableProbabilityWager.bytecode,
  fee: 1.0,
  description: "Contract description",
  instructions: "Instructions on usage: ",
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
  zksnark,
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
