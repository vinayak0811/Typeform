import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { questionsService, type QuestionPayload } from "@/services/questions-service";
import { formsKeys } from "./use-forms";
import { ApiError } from "@/services/api-client";
import type { FormDetail } from "@/types";

export function useCreateQuestion(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: QuestionPayload) => questionsService.create(formId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formsKeys.detail(formId) });
      queryClient.invalidateQueries({ queryKey: formsKeys.all });
    },
    onError: (err: ApiError) => toast.error(err.message || "Failed to add question"),
  });
}

export function useUpdateQuestion(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, data }: { questionId: string; data: Partial<QuestionPayload> }) =>
      questionsService.update(formId, questionId, data),
    // Optimistic update so inline edits feel instant while the request is in flight.
    onMutate: async ({ questionId, data }) => {
      await queryClient.cancelQueries({ queryKey: formsKeys.detail(formId) });
      const previous = queryClient.getQueryData<FormDetail>(formsKeys.detail(formId));

      if (previous) {
        queryClient.setQueryData<FormDetail>(formsKeys.detail(formId), {
          ...previous,
          questions: previous.questions.map((q) => (q.id === questionId ? { ...q, ...data } as typeof q : q)),
        });
      }
      return { previous };
    },
    onError: (err: ApiError, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(formsKeys.detail(formId), context.previous);
      }
      toast.error(err.message || "Failed to save question");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: formsKeys.detail(formId) });
    },
  });
}

export function useDeleteQuestion(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => questionsService.remove(formId, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formsKeys.detail(formId) });
      queryClient.invalidateQueries({ queryKey: formsKeys.all });
      toast.success("Question deleted");
    },
    onError: (err: ApiError) => toast.error(err.message || "Failed to delete question"),
  });
}

export function useDuplicateQuestion(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => questionsService.duplicate(formId, questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formsKeys.detail(formId) });
      queryClient.invalidateQueries({ queryKey: formsKeys.all });
    },
    onError: (err: ApiError) => toast.error(err.message || "Failed to duplicate question"),
  });
}

export function useReorderQuestions(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: string; order: number }[]) => questionsService.reorder(formId, items),
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: formsKeys.detail(formId) });
      const previous = queryClient.getQueryData<FormDetail>(formsKeys.detail(formId));

      if (previous) {
        const orderMap = new Map(items.map((i) => [i.id, i.order]));
        const reordered = [...previous.questions]
          .map((q) => ({ ...q, order: orderMap.get(q.id) ?? q.order }))
          .sort((a, b) => a.order - b.order);
        queryClient.setQueryData<FormDetail>(formsKeys.detail(formId), { ...previous, questions: reordered });
      }
      return { previous };
    },
    onError: (err: ApiError, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(formsKeys.detail(formId), context.previous);
      }
      toast.error(err.message || "Failed to reorder questions");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: formsKeys.detail(formId) });
    },
  });
}
