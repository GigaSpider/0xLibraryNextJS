import { create } from "zustand";

interface SwapStore {
  ETH_XMR_ADDRESS: string;
  XMR_ETH_ADDRESS: string;
}

export const useSwapStore = create<SwapStore>(() => ({
  ETH_XMR_ADDRESS: "",
  XMR_ETH_ADDRESS: "",
}));
