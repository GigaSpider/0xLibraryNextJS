import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Wallet } from "ethers";
import EthCrypto from "eth-crypto";

export interface WalletObject {
  wallet: Wallet;
  private_key: string;
  public_key: string;
}

export interface NetworkObject {
  network_name: string;
  chainId: number;
  balance: string;
}

const default_networks: NetworkObject[] = [
  { network_name: "mainnet", chainId: 1, balance: BigInt(0).toString() },
  {
    network_name: "optimism",
    chainId: 10,
    balance: BigInt(0).toString(),
  },
  {
    network_name: "sepolia test net",
    chainId: 11155111,
    balance: BigInt(0).toString(),
  },
];

interface WalletStore {
  wallet: WalletObject | null;
  price: bigint | null;
  networks: NetworkObject[];
  stored_wallets: WalletObject[];
  set_wallet: (private_key: string) => void;
  new_wallet: () => void;
  update_balance: (network: NetworkObject, balance: string) => void;
  update_price: (price: bigint) => void;
  delete_wallet: (wallet: WalletObject) => void;
  add_network: (network: NetworkObject) => void;
  remove_network: (network: NetworkObject) => void;
  reset_networks: () => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      balances: [],
      price: null,
      wallet: null,
      stored_wallets: [],
      networks: default_networks,
      set_wallet: (private_key: string) => {
        set((state) => {
          const wallet = new Wallet(private_key);
          const public_key = EthCrypto.publicKeyByPrivateKey(private_key);

          const walletObject: WalletObject = {
            wallet,
            private_key,
            public_key,
          };

          if (
            state.stored_wallets.some(
              (w) => w.wallet.address === wallet.address,
            )
          ) {
            return {
              ...state,
              wallet: walletObject,
            };
          }

          return {
            ...state,
            wallet: walletObject,
            stored_wallets: [...state.stored_wallets, walletObject],
          };
        });
      },
      new_wallet: () => {
        const wallet = Wallet.createRandom();
        const private_key = wallet.privateKey;

        get().set_wallet(private_key);
      },
      delete_wallet: (walletObj: WalletObject) => {
        set((state) => {
          const updatedWallets = state.stored_wallets.filter(
            (w) => w.wallet.address !== walletObj.wallet.address,
          );
          const isCurrentWallet =
            state.wallet &&
            state.wallet.wallet.address === walletObj.wallet.address;
          if (isCurrentWallet) {
            const nextWallet = updatedWallets[0] || null;
            return {
              stored_wallets: updatedWallets,
              wallet: nextWallet,
              private_key: nextWallet ? nextWallet.private_key : null,
            };
          }
          return {
            stored_wallets: updatedWallets,
          };
        });
      },
      add_network: (network: NetworkObject) => {
        set((state) => ({
          networks: [...state.networks, network],
        }));
      },
      remove_network: (network: NetworkObject) => {
        set((state) => {
          const updatedNetworks = state.networks.filter(
            (n) => n.network_name != network.network_name,
          );

          return {
            networks: updatedNetworks,
          };
        });
      },
      reset_networks: () => {
        set(() => {
          return {
            networks: default_networks,
          };
        });
      },
      update_balance: (network: NetworkObject, balance: string) => {
        set((state) => {
          const updated_network: NetworkObject = {
            network_name: network.network_name,
            chainId: network.chainId,
            balance: balance,
          };
          const networks = state.networks;
          const updated_networks = networks.map((item) =>
            item.chainId === network.chainId ? updated_network : item,
          );

          return {
            networks: updated_networks,
          };
        });
      },
      update_price: (price: bigint) => {
        set(() => {
          return {
            price: price,
          };
        });
      },
    }),
    {
      name: "wallet-store",
      partialize: (state) => ({
        wallet: state.wallet,
        stored_wallets: state.stored_wallets,
      }),
    },
  ),
);
