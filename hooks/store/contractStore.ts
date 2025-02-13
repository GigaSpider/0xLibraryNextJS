import { create } from "zustand";
import XMR_ETH from "./contractdata/XMR_ETH.json";
import ETH_XMR from "./contractdata/ETH_XMR.json";
import MASTER from "./contractdata/MASTER.json";

export type Contract = {
  id: number;
  name: string;
  address: string;
  engineer: string;
  network: string;
  proxy: boolean;
  abi: any;
  bytecode: string;
  master_address?: string;
  master_abi?: any;
  function_name?: string;
};

const ethxmr: Contract = {
  id: 1,
  name: "XMR to ETH cross chain swap",
  address: "Oxxxxxx",
  engineer: "Admin",
  network: "Optimism",
  proxy: true,
  abi: ETH_XMR.abi,
  bytecode: ETH_XMR.bytecode,
  master_address: "0xeC5c0B495Ac3460C161AB732BB910aA96A00b4A1",
  master_abi: MASTER.abi,
  function_name: "CreateEthXmrContract",
};

const xmreth: Contract = {
  id: 2,
  name: "ETH to XMR cross chain swap",
  address: "Oxxxxxx",
  engineer: "Admin",
  network: "Optimism",
  proxy: true,
  abi: XMR_ETH.abi,
  bytecode: XMR_ETH.bytecode,
  master_address: "0xeC5c0B495Ac3460C161AB732BB910aA96A00b4A1",
  master_abi: MASTER.abi,
  function_name: "CreateXmrEthContract",
};

export const contracts: Contract[] = [ethxmr, xmreth];

type ContractStore = {
  contracts: Contract[];
  SELECTED_CONTRACT: Contract | null;
  set_SELECTED_CONTRACT: (selected: Contract) => void;
};

export const useContractStore = create<ContractStore>((set) => ({
  contracts: contracts,
  SELECTED_CONTRACT: null,
  set_SELECTED_CONTRACT: (selected: Contract) =>
    set(() => ({ SELECTED_CONTRACT: selected })),
}));
