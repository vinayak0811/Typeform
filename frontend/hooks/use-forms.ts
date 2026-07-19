import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formsService, type ListFormsParams } from "@/services/forms-service";
import { ApiError } from "@/services/api-client";

export const formsKeys = {
  all: ["forms"] as const,
  list: (params: ListFormsParams) => [...formsKeys.all, "list", params] as const,
  detail: (id: string) => [...formsKeys.all, "detail", id] as const,
};

export function useForms(params: ListFormsParams = {}) {
  return useQuery({
    queryKey: formsKeys.list(params),
    queryFn: () => formsService.list(params),
  });
}

export function useForm(formId: string | undefined) {
  return useQuery({
    queryKey: formsKeys.detail(formId || ""),
    queryFn: () => formsService.get(formId as string),
    enabled: !!formId,
  });
}

function useInvalidateForms() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: formsKeys.all });
}

export function useCreateForm() {
  const invalidate = useInvalidateForms();
  return useMutation({
    mutationFn: (data: { title?: string; description?: string }) => formsService.create(data),
    onSuccess: () => {
      invalidate();
      toast.success("Form created");
    },
    onError: (err: ApiError) => toast.error(err.message || "Failed to create form"),
  });
}

export function useUpdateForm(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title?: string; description?: string }) => formsService.update(formId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formsKeys.detail(formId) });
      queryClient.invalidateQueries({ queryKey: formsKeys.all });
    },
    onError: (err: ApiError) => toast.error(err.message || "Failed to update form"),
  });
}

export function useDeleteForm() {
  const invalidate = useInvalidateForms();
  return useMutation({
    mutationFn: (formId: string) => formsService.remove(formId),
    onSuccess: () => {
      invalidate();
      toast.success("Form deleted");
    },
    onError: (err: ApiError) => toast.error(err.message || "Failed to delete form"),
  });
}

export function useDuplicateForm() {
  const invalidate = useInvalidateForms();
  return useMutation({
    mutationFn: (formId: string) => formsService.duplicate(formId),
    onSuccess: () => {
      invalidate();
      toast.success("Form duplicated");
    },
    onError: (err: ApiError) => toast.error(err.message || "Failed to duplicate form"),
  });
}

export function usePublishForm() {
  const invalidate = useInvalidateForms();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formId: string) => formsService.publish(formId),
    onSuccess: (_data, formId) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: formsKeys.detail(formId) });
      toast.success("Form published");
    },
    onError: (err: ApiError) => toast.error(err.message || "Failed to publish form"),
  });
}

export function useUnpublishForm() {
  const invalidate = useInvalidateForms();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formId: string) => formsService.unpublish(formId),
    onSuccess: (_data, formId) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: formsKeys.detail(formId) });
      toast.success("Form unpublished");
    },
    onError: (err: ApiError) => toast.error(err.message || "Failed to unpublish form"),
  });
}
