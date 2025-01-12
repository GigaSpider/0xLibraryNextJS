import { usePriceHook } from "@/hooks/price";
import { usePriceStore } from "@/hooks/store/priceStore";
import { Label } from "@/components/ui/label";

export default function PriceFeed() {
  usePriceHook();

  const { xmr_usd_price } = usePriceStore();
  return (
    <div className="p-1 flex items-center justify-between space-x-2">
      <div className="flex items-center space-x-2">
        <Label className="px-1 py-0 text-xs">USD/XMR</Label>
        <span className="text-xs font-mono text-muted-foreground">
          {xmr_usd_price}
        </span>
      </div>
    </div>
  );
}
