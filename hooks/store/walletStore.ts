import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Wallet, JsonRpcProvider, JsonRpcSigner } from "ethers";

export enum Network {
  Main = "Main",
  Optimism = "Optimism",
  Arbitrum = "Arbitrum",
  Sepolia = "Sepolia",
}

interface BalanceInfo {
  amount: bigint;
}

type Balances = Record<Network, BalanceInfo>;

// implement at a later date
// interface WalletHistory {
//   public_address: string;
//   private_key: string;
//   date: string;
//   isActive: boolean;
// }

interface WalletStore {
  balance: Balances;
  wallet: Wallet | null;
  private_key: string | null;
  providers: JsonRpcProvider[] | null;
  signers: JsonRpcSigner[] | null;
  set_balance: (network: Network, balance: BalanceInfo) => void;
  set_wallet: (wallet: Wallet) => void;
  set_providers: (providers: JsonRpcProvider[]) => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      balance: {
        [Network.Main]: { amount: BigInt(0) },
        [Network.Optimism]: { amount: BigInt(0) },
        [Network.Arbitrum]: { amount: BigInt(0) },
        [Network.Sepolia]: { amount: BigInt(0) },
      },
      wallet: null,
      private_key: null,
      providers: null,
      signers: null,
      set_balance: (network: Network, balance: BalanceInfo) =>
        set((state) => ({
          balance: {
            ...state.balance,
            [network]: balance,
          },
        })),
      set_wallet: (wallet: Wallet) =>
        set({ wallet: wallet, private_key: wallet.privateKey }),
      set_providers: async (providers: JsonRpcProvider[]) => {
        console.log(providers);
        set({ providers: providers });
      },
    }),
    {
      name: "wallet-store", // unique key in localStorage
      partialize: (state) => ({
        wallet: state.wallet,
        private_key: state.private_key,
      }),
    },
  ),
);
