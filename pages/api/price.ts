import type { NextApiRequest, NextApiResponse } from "next";

const COINMARKETCAP_API_KEY = process.env.CMC_API_KEY;
const API_URL =
  "https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const symbol = "XMR";
    const currency = "USD";

    const response = await fetch(
      `${API_URL}?symbol=${symbol}&convert=${currency}`,
      {
        method: "GET",
        headers: {
          "X-CMC_PRO_API_KEY": COINMARKETCAP_API_KEY!,
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch price from CoinMarketCap" });
    }

    const data = await response.json();
    const price = data.data[symbol].quote[currency].price;
    const timestamp = Date.now();

    res.status(200).json({ price, timestamp });
  } catch (error) {
    console.error("Error fetching price from CoinMarketCap:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
