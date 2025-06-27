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
    const { address, chainId } = req.body;

    if (!address || !chainId) {
      return res.status(400).json({ error: "invalid request body" });
    }

    console.log("fetching nonce for address: ", address);

    let provider;
    switch (chainId) {
      case 11155111:
        provider = new JsonRpcProvider(process.env.SEPOLIA_URI);
        break;
      case 10:
        provider = new JsonRpcProvider(process.env.OPTIMISM_URI);
        break;
      case 1:
        provider = new JsonRpcProvider(process.env.MAINNET_URI);
        break;
      default:
        return res.status(400).json({ error: "invalid network" });
        break;
    }

    const nonce = await provider.getTransactionCount(address);
    console.log({ nonce });

    return res.status(200).json({
      nonce,
    });
  } catch (error) {
    console.error("Broadcast error:", error);

    return res.status(500).json({
      error: "Failed to get nonce",
    });
  }
}
