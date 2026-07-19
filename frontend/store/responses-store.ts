import { create } from "zustand";

interface ResponsesState {
  page: number;
  pageSize: number;
  search: string;
  selectedResponseId: string | null;

  setPage: (page: number) => void;
  setSearch: (search: string) => void;
  selectResponse: (id: string | null) => void;
  reset: () => void;
}

export const useResponsesStore = create<ResponsesState>((set) => ({
  page: 1,
  pageSize: 10,
  search: "",
  selectedResponseId: null,

  setPage: (page) => set({ page }),
  setSearch: (search) => set({ search, page: 1 }),
  selectResponse: (id) => set({ selectedResponseId: id }),
  reset: () => set({ page: 1, search: "", selectedResponseId: null }),
}));
