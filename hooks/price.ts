import { usePriceStore } from "@/hooks/store/priceStore";
import { useEffect, useCallback } from "react";

export function usePriceHook() {
  const { set_xmr_usd_price } = usePriceStore();

  const fetchLatestPrice = useCallback(async () => {
    try {
      const response = await fetch("/api/price");
      if (!response.ok) {
        throw new Error("Failed to fetch price");
      }
      const data = await response.json();
      console.log(data.price);
      if (data.price) {
        set_xmr_usd_price(data.price.toFixed(2));
      }
    } catch (error) {
      console.error("Error fetching price:", error);
    }
  }, [set_xmr_usd_price]);

  useEffect(() => {
    // Fetch price every 60 seconds
    fetchLatestPrice(); // Fetch immediately on mount
    const interval = setInterval(fetchLatestPrice, 60000); // Fetch every 60 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [fetchLatestPrice]);

  return { fetchLatestPrice };
}
