import { create } from "zustand";
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
  wallet: HDNodeWallet | null;
  set_balance: (network: Network, balance: BalanceInfo) => void;
  set_wallet: (wallet: HDNodeWallet) => void;
};

export const useWalletStore = create<WalletStore>((set) => ({
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
  set_wallet: (data: HDNodeWallet) => set({ wallet: data }),
}));
