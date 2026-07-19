import { apiClient } from "./api-client";
import type { FormDetail, FormListItem } from "@/types";

export interface ListFormsParams {
  search?: string;
  sortBy?: "title" | "created_at" | "updated_at" | "status";
  sortDir?: "asc" | "desc";
}

function buildQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export const formsService = {
  list: (params: ListFormsParams = {}) =>
    apiClient.get<FormListItem[]>(
      `/api/forms${buildQuery({ search: params.search, sort_by: params.sortBy, sort_dir: params.sortDir })}`
    ),

  get: (formId: string) => apiClient.get<FormDetail>(`/api/forms/${formId}`),

  create: (data: { title?: string; description?: string }) =>
    apiClient.post<FormDetail>(`/api/forms`, data),

  update: (formId: string, data: { title?: string; description?: string }) =>
    apiClient.patch<FormDetail>(`/api/forms/${formId}`, data),

  remove: (formId: string) => apiClient.delete<void>(`/api/forms/${formId}`),

  duplicate: (formId: string) => apiClient.post<FormDetail>(`/api/forms/${formId}/duplicate`),

  publish: (formId: string) => apiClient.post<FormDetail>(`/api/forms/${formId}/publish`),

  unpublish: (formId: string) => apiClient.post<FormDetail>(`/api/forms/${formId}/unpublish`),
};
