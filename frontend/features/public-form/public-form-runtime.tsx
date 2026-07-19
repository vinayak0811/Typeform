"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { usePublicForm, useSubmitResponse } from "@/hooks/use-responses";
import { usePreviewStore } from "@/store/preview-store";
import { ConversationalForm } from "./conversational-form";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/services/api-client";
import type { AnswerSubmit } from "@/types";

export function PublicFormRuntime({ formId }: { formId: string }) {
  const { data: form, isLoading, isError, error } = usePublicForm(formId);
  const submitResponse = useSubmitResponse(formId);
  const goToStep = usePreviewStore((s) => s.goToStep);

  useEffect(() => {
    if (submitResponse.isSuccess && form) {
      goToStep(form.questions.length);
    }
  }, [submitResponse.isSuccess, form, goToStep]);

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-4 px-6">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="mt-6 h-14 w-full" />
      </div>
    );
  }

  if (isError || !form) {
    const status = error instanceof ApiError ? error.status : 404;
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold">{status === 404 ? "This form isn't available" : "Something went wrong"}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {status === 404
            ? "This form may have been unpublished, deleted, or the link is incorrect."
            : "Please try refreshing the page."}
        </p>
      </div>
    );
  }

  function handleSubmit(answers: AnswerSubmit[]) {
    submitResponse.mutate(answers);
  }

  return (
    <ConversationalForm
      form={form}
      mode="live"
      onSubmit={handleSubmit}
      isSubmitting={submitResponse.isPending}
      submitError={
        submitResponse.isError
          ? submitResponse.error instanceof ApiError
            ? submitResponse.error.message
            : "Failed to submit response"
          : null
      }
    />
  );
}
