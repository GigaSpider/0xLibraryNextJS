import { useWalletStore, Network } from "./store/walletStore";
import { JsonRpcProvider, formatEther } from "ethers";
import { useEffect } from "react";

export function useWalletHook() {
  const { wallet, set_balance } = useWalletStore();

  useEffect(() => {
    if (!wallet) return;
    const address = wallet.address;

    console.log("checkpoint, starting wallet hook");

    const MAIN_PROVIDER = new JsonRpcProvider(
      process.env.NEXT_PUBLIC_MAINNET_URI!,
    );
    const OPTIMISM_PROVIDER = new JsonRpcProvider(
      process.env.NEXT_PUBLIC_OPTIMISM_URI!,
    );
    const ARBITRUM_PROVIDER = new JsonRpcProvider(
      process.env.NEXT_PUBLIC_ARBITRUM_URI!,
    );

    async function fetchBalances() {
      console.log("Getting blockchain data every 10 seconds...");
      try {
        const MAIN_BALANCE = await MAIN_PROVIDER.getBalance(address);
        const OPTIMISM_BALANCE = await OPTIMISM_PROVIDER.getBalance(address);
        const ARBITRUM_BALANCE = await ARBITRUM_PROVIDER.getBalance(address);
        const balances = [
          parseFloat(formatEther(MAIN_BALANCE)),
          parseFloat(formatEther(OPTIMISM_BALANCE)),
          parseFloat(formatEther(ARBITRUM_BALANCE)),
        ];
        console.log("balances: ", balances);

        set_balance(Network.Main, {
          amount: MAIN_BALANCE,
        });
        set_balance(Network.Optimism, {
          amount: OPTIMISM_BALANCE,
        });
        set_balance(Network.Arbitrum, {
          amount: ARBITRUM_BALANCE,
        });
      } catch (error) {
        console.log("Error fetching balances: ", error);
      }
    }
    fetchBalances();

    const interval = setInterval(fetchBalances, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [wallet, set_balance]);
}
