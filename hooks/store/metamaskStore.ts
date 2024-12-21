import { create } from "zustand";

interface MetaMaskState {
  isConnected: boolean;
  error: string | null;
  account: string | null;
  chainId: string | null;
  // Actions
  setIsConnected: (isConnected: boolean) => void;
  setError: (error: string | null) => void;
  setAccount: (account: string | null) => void;
  setChainId: (chainId: string | null) => void;
  reset: () => void;
}

export const useMetaMaskStore = create<MetaMaskState>((set) => ({
  isConnected: false,
  error: null,
  account: null,
  chainId: null,
  setIsConnected: (isConnected) => set({ isConnected }),
  setError: (error) => set({ error }),
  setAccount: (account) => set({ account }),
  setChainId: (chainId) => set({ chainId }),
  reset: () =>
    set({
      isConnected: false,
      error: null,
      account: null,
      chainId: null,
    }),
}));
