import { create } from "zustand";

export enum Status {
  connected,
  pending,
  disconnected,
}

interface WebsocketStore {
  status: Status;
  set_status: (newStatus: Status) => void;
}

export const useWebsocketStore = create<WebsocketStore>((set) => ({
  status: Status.disconnected,
  set_status: (newStatus: Status) =>
    set(() => ({
      status: newStatus,
    })),
}));
