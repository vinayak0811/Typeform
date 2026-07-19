import { apiClient } from "./api-client";
import type {
  AnswerSubmit,
  FormAnalytics,
  PaginatedResponses,
  PublicForm,
  ResponseDetail,
} from "@/types";

export const responsesService = {
  list: (formId: string, page = 1, pageSize = 20, search?: string) => {
    const query = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (search) query.set("search", search);
    return apiClient.get<PaginatedResponses>(`/api/forms/${formId}/responses?${query.toString()}`);
  },

  get: (formId: string, responseId: string) =>
    apiClient.get<ResponseDetail>(`/api/forms/${formId}/responses/${responseId}`),
};

export const analyticsService = {
  get: (formId: string) => apiClient.get<FormAnalytics>(`/api/forms/${formId}/analytics`),
};

export const publicFormService = {
  get: (formId: string) => apiClient.get<PublicForm>(`/api/public/forms/${formId}`),

  submit: (formId: string, answers: AnswerSubmit[], completed = true) =>
    apiClient.post<ResponseDetail>(`/api/public/forms/${formId}/responses`, { completed, answers }),
};
