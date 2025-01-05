import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Event = {
  event: string;
  timestamp: number;
};

type EventStore = {
  events: Event[];
  add_event: (newEvent: Event) => void;
};

export const useEventStore = create<EventStore>()(
  persist(
    (set) => ({
      events: [], // Initial state
      add_event: (newEvent) =>
        set((state) => ({
          events: [...state.events, newEvent], // Add new event immutably
        })),
    }),
    {
      name: "event-storage", // Key for localStorage or sessionStorage
    },
  ),
);
