// import { Network } from "@/components/Wallet/Wallet";
// import { createAcrossClient } from "@across-protocol/app-sdk";
import { mainnet, optimism, arbitrum } from "viem/chains";

// const client = createAcrossClient({
//   integratorId: "your-integrator-ID",
//   chains: [mainnet, optimism, arbitrum],
// });

export async function bridge(
  fromNetwork: string,
  toNetwork: string,
  amount: number,
  private_key: string,
) {
  const quote = await client.getQuote;
}
