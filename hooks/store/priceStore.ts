import { create } from "zustand";

// Define the store type
type PriceStore = {
  xmr_usd_price: number; // Store the latest price as a Price object or null initially
  set_xmr_usd_price: (newPrice: number) => void; // Function to update the price
};

// Create the Zustand store
export const usePriceStore = create<PriceStore>((set) => ({
  xmr_usd_price: 200, // Initial state

  // Method to update the price
  set_xmr_usd_price: (newPrice: number) =>
    set(() => ({
      xmr_usd_price: newPrice,
    })),
}));
