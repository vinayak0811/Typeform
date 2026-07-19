import { create } from "zustand";

interface PreviewState {
  currentStep: number; // -1 = welcome/cover, questions.length = thank-you screen
  answers: Record<string, { value_text?: string | null; value_number?: number | null; choice_id?: string | null }>;
  fieldErrors: Record<string, string>;
  direction: 1 | -1; // for slide transition direction

  goNext: (totalSteps: number) => void;
  goPrevious: () => void;
  goToStep: (step: number) => void;
  setAnswer: (questionId: string, value: PreviewState["answers"][string]) => void;
  setFieldError: (questionId: string, message: string | null) => void;
  reset: () => void;
}

export const usePreviewStore = create<PreviewState>((set, get) => ({
  currentStep: -1,
  answers: {},
  fieldErrors: {},
  direction: 1,

  goNext: (totalSteps) =>
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, totalSteps),
      direction: 1,
    })),

  goPrevious: () =>
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, -1),
      direction: -1,
    })),

  goToStep: (step) => set({ currentStep: step, direction: 1 }),

  setAnswer: (questionId, value) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: { ...state.answers[questionId], ...value } },
      fieldErrors: { ...state.fieldErrors, [questionId]: "" },
    })),

  setFieldError: (questionId, message) =>
    set((state) => ({
      fieldErrors: { ...state.fieldErrors, [questionId]: message || "" },
    })),

  reset: () => set({ currentStep: -1, answers: {}, fieldErrors: {}, direction: 1 }),
}));
