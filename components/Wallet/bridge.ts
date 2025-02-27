import { JsonRpcProvider } from "ethers";

export default function bridge(
  source_provider: JsonRpcProvider,
  target_provider: JsonRpcProvider,
) {
  console.log(source_provider, target_provider);
}
