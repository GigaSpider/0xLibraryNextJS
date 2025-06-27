import { NextApiRequest, NextApiResponse } from "next";
import { JsonRpcProvider, Contract } from "ethers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const provider = new JsonRpcProvider(process.env.MAINNET_URI);

  try {
    console.log("hello");
    const priceFeed = new Contract(
      ETH_USD_PRICE_ADDRESS,
      aggregatorV3InterfaceABI,
      provider,
    );
    const data = await priceFeed.latestRoundData();
    const usdEth = data[1].toString();
    console.log({ usdEth });

    if (usdEth) {
      res.status(200).json({ usdEth });
    } else {
      res.status(501).json({ error: "data not returned from chainlink" });
    }
  } catch (error) {
    res.status(500).json({ error: `Try block failure, ${error}` });
  }
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
