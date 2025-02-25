import { create } from "zustand";

type ApiStore = {
  connection_status: boolean;
  set_connection_status: (status: boolean) => void;
};

export const useApiStore = create<ApiStore>((set) => ({
  connection_status: false,
  set_connection_status: (status: boolean) =>
    set(() => ({ connection_status: status })),
}));
