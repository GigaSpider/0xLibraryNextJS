import { useWalletStore, NetworkObject } from "./store/walletStore";
import { useEffect, useState } from "react";

export function useWalletHook() {
  const { wallet, update_balance, update_price } = useWalletStore();
  const [timeUntilUpdate, setTimeUntilUpdate] = useState(30);

  useEffect(() => {
    if (!wallet) return;

    const address = wallet.wallet.address;
    console.log("checkpoint, starting wallet hook");

    let isMounted = true; // Prevent updates after unmount

    async function fetchPrice() {
      if (!isMounted) return;
      try {
        const response = await fetch("/api/GetPrice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();
        if (result.usdEth && isMounted) {
          update_price(BigInt(result.usdEth));
        }
      } catch (error) {
        console.log(error);
      }
    }

    async function fetchBalances() {
      if (!isMounted) return;
      try {
        const response = await fetch("/api/GetBalances", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        });
        if (!response.ok || !isMounted) return;

        const result = await response.json();
        if (result.balances && isMounted) {
          result.balances.forEach((object: NetworkObject) => {
            update_balance(object, object.balance);
          });
        }
      } catch (error) {
        console.log(error);
      }
    }

    async function fetchData() {
      if (!isMounted) return;
      console.log("refreshing data every 30 seconds:");
      await fetchPrice();
      await fetchBalances();
      if (isMounted) setTimeUntilUpdate(30);
    }

    fetchData(); // Initial fetch
    const dataInterval = setInterval(fetchData, 30000);
    const countdownInterval = setInterval(() => {
      if (!isMounted) return;
      setTimeUntilUpdate((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(dataInterval);
      clearInterval(countdownInterval);
    };
  }, [wallet?.wallet?.address]); // Only depend on address, not the whole objects

  return { timeUntilUpdate };
}

// rework the ethereum rpc calls and hide the api keys behind api routes with rate limiting. check

// Create a new encryption tool for asymetric encryption of monero addresses, make the necessary changes to the oracle server to accomodate it

// Add an information subpanel in the contract execution panel which displays live data
// about the smart contract

// Make the wallet actions production ready

// Do all of that and create an advertising plan
