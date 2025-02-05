import { create } from "zustand";
import { Signer, BrowserProvider, Contract } from "ethers";
import ETH_XMR from "@/components/Contracts/ETH_XMR.json";

type State = {
  MASTER_ADDRESS: string;
  ETH_XMR_ADDRESS: string;
  ETH_XMR_CONTRACT: Contract | null;
  ETH_XMR_ETHERSCAN_LINK: string;
  XMR_ETH_ETHERSCAN_LINK: string;
  MASTER_ETHERSCAN_LINK: string;
  XMR_ETH_ADDRESS: string;
  XMR_DEPOSIT_ADDRESS: string;
  XMR_TXID: string;
  EXCHANGE_RATE: number | null;
  provider: BrowserProvider | null;
  signer: Signer | null;
  is_connected: boolean;
};

type Action = {
  update_ETH_XMR_ADDRESS: (ETH_XMR_ADDRESS: State["ETH_XMR_ADDRESS"]) => void;
  update_XMR_ETH_ADDRESS: (ETH_XMR_ADDRESS: State["XMR_ETH_ADDRESS"]) => void;
  update_provider: (provider: State["provider"]) => void;
  update_signer: (signer: State["signer"]) => void;
  update_XMR_TXID: (XMR_TXID: State["XMR_TXID"]) => void;
  update_EXCHANGE_RATE: (EXCHANGE_RATE: State["EXCHANGE_RATE"]) => void;
  update_XMR_DEPOSIT_ADDRESS: (
    XMR_DEPOSIT_ADDRESS: State["XMR_DEPOSIT_ADDRESS"],
  ) => void;
  update_is_connected: (is_connected: State["is_connected"]) => void;
};

export const useSwapStore = create<State & Action>((set, get) => ({
  MASTER_ADDRESS: process.env.NEXT_PUBLIC_MASTER_ADDRESS!,
  MASTER_ETHERSCAN_LINK: `https://polygonscan.com/address/${process.env.NEXT_PUBLIC_MASTER_ADDRESS}`,
  ETH_XMR_ADDRESS: "",
  XMR_ETH_ADDRESS: "",
  ETH_XMR_ETHERSCAN_LINK: "",
  XMR_ETH_ETHERSCAN_LINK: "",
  XMR_DEPOSIT_ADDRESS: "",
  XMR_TXID: "",
  EXCHANGE_RATE: null,
  ETH_XMR_CONTRACT: null,
  provider: null,
  signer: null,
  is_connected: false,
  update_is_connected: (is_connected) =>
    set(() => ({ is_connected: is_connected })),
  update_provider: (provider) => set(() => ({ provider: provider })),
  update_signer: (signer) => set(() => ({ signer: signer })),
  update_ETH_XMR_ADDRESS: (ETH_XMR_ADDRESS) => {
    const { provider, signer } = get();
    let contract = null;

    try {
      if (signer) {
        contract = new Contract(ETH_XMR_ADDRESS, ETH_XMR.abi, signer);
      } else if (provider) {
        contract = new Contract(ETH_XMR_ADDRESS, ETH_XMR.abi, provider);
      }
    } catch (error) {
      console.error("Error creating contract:", error);
    }

    set(() => ({
      ETH_XMR_ADDRESS,
      ETH_XMR_ETHERSCAN_LINK: `https://polygonscan/address/${ETH_XMR_ADDRESS}`,
      ETH_XMR_CONTRACT: contract,
    }));
  },
  update_XMR_ETH_ADDRESS: (XMR_ETH_ADDRESS) =>
    set(() => ({
      XMR_ETH_ADDRESS: XMR_ETH_ADDRESS,
      XMR_ETH_ETHERSCAN_LINK: `https://polygonscan/address/${XMR_ETH_ADDRESS}`,
    })),
  update_XMR_TXID: (XMR_TXID) => set(() => ({ XMR_TXID: XMR_TXID })),
  update_EXCHANGE_RATE: (EXCHANGE_RATE) =>
    set(() => ({ EXCHANGE_RATE: EXCHANGE_RATE })),
  update_XMR_DEPOSIT_ADDRESS: (XMR_DEPOSIT_ADDRESS) =>
    set(() => ({
      XMR_DEPOSIT_ADDRESS: XMR_DEPOSIT_ADDRESS,
    })),
}));
