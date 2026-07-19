import { create } from "zustand";

interface UIState {
  deleteFormDialogId: string | null;
  renameFormDialogId: string | null;
  dashboardView: "grid" | "list";

  openDeleteFormDialog: (id: string) => void;
  closeDeleteFormDialog: () => void;
  openRenameFormDialog: (id: string) => void;
  closeRenameFormDialog: () => void;
  setDashboardView: (view: "grid" | "list") => void;
}

export const useUIStore = create<UIState>((set) => ({
  deleteFormDialogId: null,
  renameFormDialogId: null,
  dashboardView: "grid",

  openDeleteFormDialog: (id) => set({ deleteFormDialogId: id }),
  closeDeleteFormDialog: () => set({ deleteFormDialogId: null }),
  openRenameFormDialog: (id) => set({ renameFormDialogId: id }),
  closeRenameFormDialog: () => set({ renameFormDialogId: null }),
  setDashboardView: (view) => set({ dashboardView: view }),
}));
