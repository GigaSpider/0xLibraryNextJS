import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

// Map chainID to Infura URI
function getProviderUrl(chainId: number): string {
  switch (chainId) {
    case 1: // Ethereum Mainnet
      return process.env.INFURA_MAINNET_URI!;
    case 10: // Optimism
      return process.env.INFURA_OPTIMISM_URI!;
    case 11155111: // Sepolia
      return process.env.INFURA_SEPOLIA_URI!;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { contractAddress, eventTopicHash, chainId } = req.body;

    if (!contractAddress || !eventTopicHash || !chainId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Get the appropriate provider URL for the chain
    const providerUrl = getProviderUrl(chainId);
    const provider = new ethers.JsonRpcProvider(providerUrl);

    // Get current block number
    const currentBlock = await provider.getBlockNumber();

    // Query events from last 100 blocks (adjust as needed)
    const fromBlock = Math.max(0, currentBlock - 100);

    // Query logs directly using the topic hash
    const logs = await provider.getLogs({
      address: contractAddress,
      topics: [eventTopicHash], // First topic is the event signature hash
      fromBlock: fromBlock,
      toBlock: currentBlock,
    });

    // Convert logs to plain objects
    const serializedEvents = logs.map((log) => ({
      transactionHash: log.transactionHash,
      blockNumber: log.blockNumber,
      topics: log.topics,
      data: log.data,
      address: log.address,
    }));

    res.status(200).json({ events: serializedEvents });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      error: "Failed to fetch events",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

//test
