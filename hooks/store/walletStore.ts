import { create } from "zustand";
import { persist } from "zustand/middleware";
import { HDNodeWallet, JsonRpcProvider, JsonRpcSigner } from "ethers";

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
  private_key: string | null;
  providers: JsonRpcProvider[] | null;
  signers: JsonRpcSigner[] | null;
  set_balance: (network: Network, balance: BalanceInfo) => void;
  set_wallet: (wallet: HDNodeWallet) => void;
  set_providers: (providers: JsonRpcProvider[]) => void;
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
      set_wallet: (wallet: HDNodeWallet) =>
        set({ wallet: wallet, private_key: wallet.privateKey }),
      set_providers: async (providers: JsonRpcProvider[]) => {
        // const signers: JsonRpcSigner[] = await Promise.all(
        //   providers.map(async (provider) => await provider.getSigner()),
        // );
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
