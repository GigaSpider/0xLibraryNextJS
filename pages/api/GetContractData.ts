// pages/api/contract-balance.ts
import { NextApiRequest, NextApiResponse } from "next";
import { JsonRpcProvider, formatEther } from "ethers";

function getProviderUrl(chainId: number): string {
  switch (chainId) {
    case 1: // Ethereum Mainnet
      return process.env.MAINNET_URI!;
    case 10: // Optimism
      return process.env.OPTIMISM_URI!;
    case 11155111: // Sepolia
      return process.env.SEPOLIA_URI!;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { chainId, contract_address } = req.body;

  try {
    const provider_uri = getProviderUrl(chainId);
    const provider = new JsonRpcProvider(provider_uri);

    const currentBlock = await provider.getBlockNumber();

    // Calculate blocks for 48 hours (assuming ~12 second block time for Ethereum)
    // Adjust this based on your blockchain's block time
    const blocksIn48Hours = Math.floor((48 * 60 * 60) / 12);
    const startBlock = Math.max(0, currentBlock - blocksIn48Hours);

    // Sample every N blocks to avoid too many requests
    const sampleInterval = Math.max(1, Math.floor(blocksIn48Hours / 100)); // 100 data points max

    const balanceData = [];

    for (
      let blockNum = startBlock;
      blockNum <= currentBlock;
      blockNum += sampleInterval
    ) {
      try {
        const balance = await provider.getBalance(contract_address, blockNum);
        const block = await provider.getBlock(blockNum);

        if (block) {
          balanceData.push({
            blockNumber: blockNum,
            balance: formatEther(balance),
            timestamp: block.timestamp * 1000, // Convert to milliseconds
          });
        }
      } catch (error) {
        console.error(`Error fetching balance at block ${blockNum}:`, error);
        // Continue with next block
      }
    }

    res.status(200).json({ data: balanceData });
  } catch (error) {
    console.error("Error fetching contract balance:", error);
    res.status(500).json({ message: "Error fetching contract balance" });
  }
}
