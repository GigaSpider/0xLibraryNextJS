import { useEffect } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import { useSwapStore } from "@/hooks/store/zustand";

interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (params: any) => void) => void;
  removeListener: (event: string, callback: (params: any) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function useMetaMask() {
  const { update_provider, update_signer, update_is_connected } =
    useSwapStore();

  const connect = async (): Promise<{
    provider: BrowserProvider;
    signer: JsonRpcSigner;
  }> => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    console.log("using connect function from useMetaMask hook");

    try {
      // First, try to switch to Optimism mainnet
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xa" }], // Optimism mainnet chainId (10 in decimal)
        });
      } catch (error: any) {
        // If Optimism isn't added to MetaMask, add it
        if (error.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xa",
                chainName: "Optimism",
                rpcUrls: ["https://mainnet.optimism.io"],
                nativeCurrency: {
                  name: "Ether",
                  symbol: "ETH",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://optimistic.etherscan.io"],
              },
            ],
          });
        } else {
          throw error;
        }
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      update_provider(provider);
      update_signer(signer);
      update_is_connected(true);

      return { provider, signer };
    } catch (error) {
      console.error("Failed to connect to MetaMask:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts) => update_is_connected(accounts.length > 0));

      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        update_is_connected(accounts.length > 0);
      });

      window.ethereum.on("chainChanged", (_chainId: string) => {
        // Handle chain changes – you might want to refresh the page
        window.location.reload();
      });
    }
  }, [update_is_connected]);

  return { connect };
}
