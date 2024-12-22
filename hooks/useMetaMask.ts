import { useEffect } from "react";
import { BrowserProvider } from "ethers";
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

  const connect = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
        params: [{ chainId: "0xAA36A7" }],
      });

      if (accounts.length > 0) {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        update_provider(provider);
        update_signer(signer);
        update_is_connected(true);
        return accounts[0];
      }
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
    }
  }, [update_is_connected]);

  return { connect };
}
