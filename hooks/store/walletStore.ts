import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HDNodeWallet } from "ethers";

export enum Network {
  Main = "Main",
  Optimism = "Optimism",
  Arbitrum = "Arbitrum",
}

type BalanceInfo = {
  amount: bigint;
};

type Balances = Record<Network, BalanceInfo>;

type WalletStore = {
  balance: Balances;
  // We'll persist only the wallet (which you store as an HDNodeWallet)
  wallet: HDNodeWallet | null;
  set_balance: (network: Network, balance: BalanceInfo) => void;
  set_wallet: (wallet: HDNodeWallet) => void;
  // get_wallet: () => HDNodeWallet | null;
};

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      balance: {
        [Network.Main]: { amount: BigInt(0) },
        [Network.Optimism]: { amount: BigInt(0) },
        [Network.Arbitrum]: { amount: BigInt(0) },
      },
      wallet: null,
      set_balance: (network: Network, balance: BalanceInfo) =>
        set((state) => ({
          balance: {
            ...state.balance,
            [network]: balance,
          },
        })),
      set_wallet: (wallet: HDNodeWallet) => set({ wallet: wallet }),
      // get_wallet: () => {
      //   const storedWallet = get().wallet;
      //   if (!storedWallet) return null;
      //   return storedWallet;
      // },
    }),
    {
      name: "wallet-store", // unique key in localStorage
      // Only persist the wallet property to avoid JSON serializing BigInts.
      partialize: (state) => ({ wallet: state.wallet }),
    },
  ),
);
