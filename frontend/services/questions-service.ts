import { apiClient } from "./api-client";
import type { Question, QuestionType, QuestionSettings, Choice } from "@/types";

export interface QuestionPayload {
  type: QuestionType;
  title?: string;
  description?: string;
  required?: boolean;
  order?: number;
  settings?: QuestionSettings;
  choices?: Partial<Choice>[];
}

export const questionsService = {
  create: (formId: string, data: QuestionPayload) =>
    apiClient.post<Question>(`/api/forms/${formId}/questions`, data),

  update: (formId: string, questionId: string, data: Partial<QuestionPayload>) =>
    apiClient.patch<Question>(`/api/forms/${formId}/questions/${questionId}`, data),

  remove: (formId: string, questionId: string) =>
    apiClient.delete<void>(`/api/forms/${formId}/questions/${questionId}`),

  duplicate: (formId: string, questionId: string) =>
    apiClient.post<Question>(`/api/forms/${formId}/questions/${questionId}/duplicate`),

  reorder: (formId: string, items: { id: string; order: number }[]) =>
    apiClient.post<void>(`/api/forms/${formId}/questions/reorder`, items),
};
