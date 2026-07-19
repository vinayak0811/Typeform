import { create } from "zustand";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

interface BuilderState {
  selectedQuestionId: string | null;
  autosaveStatus: AutosaveStatus;
  isDragging: boolean;

  selectQuestion: (id: string | null) => void;
  setAutosaveStatus: (status: AutosaveStatus) => void;
  setDragging: (isDragging: boolean) => void;
  reset: () => void;
}

export const useBuilderStore = create<BuilderState>((set) => ({
  selectedQuestionId: null,
  autosaveStatus: "idle",
  isDragging: false,

  selectQuestion: (id) => set({ selectedQuestionId: id }),
  setAutosaveStatus: (status) => set({ autosaveStatus: status }),
  setDragging: (isDragging) => set({ isDragging }),
  reset: () => set({ selectedQuestionId: null, autosaveStatus: "idle", isDragging: false }),
}));
