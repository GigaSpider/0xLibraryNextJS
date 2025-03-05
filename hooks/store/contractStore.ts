import { create } from "zustand";
import { Contract } from "ethers";
import XMR_ETH from "./contractdata/XMR_ETH.json";
import ETH_XMR from "./contractdata/ETH_XMR.json";
import ETH_MIXER from "./contractdata/ETH_MIXER.json";
import ETH_ODDS from "./contractdata/ETH_ODDS.json";
import MASTER from "./contractdata/MASTER.json";

export enum NetworkIndex {
  "Mainnet" = 0,
  "Optimism" = 1,
  "Arbitrum" = 2,
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
  mapping_name?: string;
};

const ethxmr: SmartContract = {
  id: 1,
  name: "Decentralized Noncustodial ETH/XMR Swap",
  address: "Oxxxxxx",
  engineer: "Admin",
  network: "Optimism",
  proxy: true,
  abi: ETH_XMR.abi,
  bytecode: ETH_XMR.bytecode,
  fee: 1.0,
  description: "Contract description",
  instructions: "Instructions on usage: ",
  master_address: "0xeC5c0B495Ac3460C161AB732BB910aA96A00b4A1",
  master_abi: MASTER.abi,
  function_name: "CreateEthXmrContract",
  mapping_name: "ETH_XMR_CONTRACTS",
};

const xmreth: SmartContract = {
  id: 2,
  name: "Decentralized Noncustodial XMR/ETH Swap",
  address: "Oxxxxxx",
  engineer: "Admin",
  network: "Optimism",
  proxy: true,
  abi: XMR_ETH.abi,
  bytecode: XMR_ETH.bytecode,
  fee: 1.0,
  description: "Contract description",
  instructions: "Instructions on usage: ",
  master_address: "0xeC5c0B495Ac3460C161AB732BB910aA96A00b4A1",
  master_abi: MASTER.abi,
  function_name: "CreateXmrEthContract",
  mapping_name: "XMR_ETH_CONTRACTS",
};

const tumbler: SmartContract = {
  id: 3,
  name: "Ethereum obfuscation service (coin mixer)",
  address: "0x0000000000",
  engineer: "Admin",
  network: "Arbitrum",
  proxy: false,
  abi: ETH_MIXER.abi,
  bytecode: ETH_MIXER.bytecode,
  fee: 0.1,
  description: "Contract description",
  instructions: "Instructions on usage: ",
};

const gambler: SmartContract = {
  id: 4,
  name: "Variable odds dice roller (supports the website)",
  address: "0x0000000000",
  engineer: "Admin",
  network: "Arbitrum",
  proxy: false,
  abi: ETH_ODDS.abi,
  bytecode: ETH_ODDS.bytecode,
  fee: 0.2,
  description: "Contract description",
  instructions: "Instructions on usage: ",
};

export const contracts: SmartContract[] = [ethxmr, xmreth, tumbler, gambler];

type ContractStore = {
  contracts: SmartContract[];
  INITIALIZED_CONTRACT: Contract | null;
  SELECTED_CONTRACT: SmartContract | null;
  set_SELECTED_CONTRACT: (selected: SmartContract) => void;
  set_INITIALIZED_CONTRACT: (proxy: Contract | null) => void;
};

export const useContractStore = create<ContractStore>((set) => ({
  contracts: contracts,
  SELECTED_CONTRACT: null,
  INITIALIZED_CONTRACT: null,
  set_SELECTED_CONTRACT: (selected: SmartContract) =>
    set(() => ({ SELECTED_CONTRACT: selected })),
  set_INITIALIZED_CONTRACT: (proxy: Contract | null) =>
    set(() => ({ INITIALIZED_CONTRACT: proxy })),
}));
