import { JsonRpcProvider } from "ethers";
import { NetworkObject } from "@/hooks/store/walletStore";
import { NextApiRequest, NextApiResponse } from "next";

// Create providers once, reuse them
const main_provider = new JsonRpcProvider(process.env.MAINNET_URI);
const optimism_provider = new JsonRpcProvider(process.env.OPTIMISM_URI);
const sepolia_provider = new JsonRpcProvider(process.env.SEPOLIA_URI);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { address } = req.body;
  const balances: NetworkObject[] = [];

  try {
    const main_balance = await main_provider.getBalance(address);
    balances.push({
      network_name: "mainnet",
      chainId: 1,
      balance: main_balance.toString(),
    });

    const optimism_balance = await optimism_provider.getBalance(address);
    balances.push({
      network_name: "optimism",
      chainId: 10,
      balance: optimism_balance.toString(),
    });

    const sepolia_balance = await sepolia_provider.getBalance(address);
    balances.push({
      network_name: "sepolia",
      chainId: 11155111,
      balance: sepolia_balance.toString(),
    });

    return res.status(200).json({ balances });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to fetch balances" });
  }
}
