import { NextApiRequest, NextApiResponse } from "next";
import { JsonRpcProvider } from "ethers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { signedTransaction, chainId } = req.body;

    if (!signedTransaction) {
      return res.status(400).json({ error: "Signed transaction is required" });
    }

    // Set up provider based on network
    let provider;
    switch (chainId) {
      case 1:
        provider = new JsonRpcProvider(process.env.MAINNET_RPC_URL);
        break;
      case 10:
        provider = new JsonRpcProvider(process.env.OPTIMISM_RPC_URL);
        break;
      case 11155111:
        provider = new JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
        break;
      default:
        return res.status(400).json({ error: "Invalid network" });
    }

    // Broadcast the signed transaction
    const txResponse = await provider.broadcastTransaction(signedTransaction);

    // Wait for transaction confirmation (optional)
    const receipt = await txResponse.wait();

    console.log(`Transaction successful: ${txResponse.hash}`);

    return res.status(200).json({
      txHash: txResponse.hash,
      blockNumber: receipt!.blockNumber,
      gasUsed: receipt!.gasUsed.toString(),
    });
  } catch (error) {
    console.error("Transaction error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Transaction failed",
    });
  }
}
