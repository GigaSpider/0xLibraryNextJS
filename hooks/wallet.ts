import { useWalletStore } from "./store/walletStore";
import { Contract, formatEther } from "ethers";
import { useEffect, useState } from "react";

export function useWalletHook() {
  const { wallet, networks, update_balance, update_price } = useWalletStore();
  const [timeUntilUpdate, setTimeUntilUpdate] = useState(30); // Initialize to 30 seconds

  const priceFeed = new Contract(
    ETH_USD_PRICE_ADDRESS,
    aggregatorV3InterfaceABI,
    networks[0].provider,
  );

  useEffect(() => {
    if (!wallet) return;
    const address = wallet.wallet.address;

    console.log("checkpoint, starting wallet hook");

    fetchData();

    async function fetchPrice() {
      await priceFeed.latestRoundData().then((data) => {
        const usdEth = data[1];
        console.log({ usdEth });
        update_price(usdEth);
      });
    }

    async function fetchBalances() {
      networks.forEach(async (network) => {
        try {
          const balance = await network.provider.getBalance(address);
          const name = network.network_name;
          console.log({ name, balance });
          if (balance != network.balance) {
            update_balance(network, balance);
          }
        } catch (error) {
          console.log(
            "Error fetching balances for network",
            network.network_name,
          );
        }
      });
    }

    async function fetchData() {
      console.log("refreshing data every 30 seconds:");
      await fetchPrice();
      await fetchBalances();
      setTimeUntilUpdate(30); // Reset countdown after fetch
    }

    const dataInterval = setInterval(fetchData, 30000);

    // Countdown timer interval
    const countdownInterval = setInterval(() => {
      setTimeUntilUpdate((prev) => {
        if (prev <= 1) return 0; // Prevent negative countdown
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(countdownInterval);
    };
  }, [wallet, update_balance, networks, update_price]);

  return { timeUntilUpdate };
}

const ETH_USD_PRICE_ADDRESS = "0x5147eA642CAEF7BD9c1265AadcA78f997AbB9649";

const aggregatorV3InterfaceABI = [
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "description",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint80", name: "_roundId", type: "uint80" }],
    name: "getRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];
