import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { responsesService, analyticsService, publicFormService } from "@/services/responses-service";
import type { AnswerSubmit } from "@/types";

export function useResponses(formId: string, page: number, pageSize: number, search: string) {
  return useQuery({
    queryKey: ["responses", formId, page, pageSize, search],
    queryFn: () => responsesService.list(formId, page, pageSize, search || undefined),
    enabled: !!formId,
  });
}

export function useResponseDetail(formId: string, responseId: string | null) {
  return useQuery({
    queryKey: ["responses", formId, "detail", responseId],
    queryFn: () => responsesService.get(formId, responseId as string),
    enabled: !!formId && !!responseId,
  });
}

export function useFormAnalytics(formId: string | undefined) {
  return useQuery({
    queryKey: ["analytics", formId],
    queryFn: () => analyticsService.get(formId as string),
    enabled: !!formId,
  });
}

export function usePublicForm(formId: string) {
  return useQuery({
    queryKey: ["public-form", formId],
    queryFn: () => publicFormService.get(formId),
    enabled: !!formId,
    retry: false,
  });
}

export function useSubmitResponse(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (answers: AnswerSubmit[]) => publicFormService.submit(formId, answers, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["responses", formId] });
      queryClient.invalidateQueries({ queryKey: ["analytics", formId] });
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });
}
