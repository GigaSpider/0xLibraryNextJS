import { usePriceHook } from "@/hooks/price";
import { usePriceStore } from "@/hooks/store/priceStore";

export default function PriceFeed() {
  usePriceHook();

  const { xmr_usd_price } = usePriceStore();
  return <>USDC/XMR ${xmr_usd_price}</>;
}
