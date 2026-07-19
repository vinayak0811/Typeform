"use client";

import { useEffect } from "react";
import { useForm } from "@/hooks/use-forms";
import { useBuilderStore } from "@/store/builder-store";
import { BuilderTopbar } from "./builder-topbar";
import { QuestionSidebar } from "./question-sidebar";
import { QuestionEditorPanel } from "./question-editor-panel";
import { EmptyBuilderState } from "./empty-builder-state";
import { LivePreviewPanel } from "./live-preview-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export function BuilderPage({ formId }: { formId: string }) {
  const { data: form, isLoading, isError } = useForm(formId);
  const selectedQuestionId = useBuilderStore((s) => s.selectedQuestionId);
  const selectQuestion = useBuilderStore((s) => s.selectQuestion);
  const resetBuilder = useBuilderStore((s) => s.reset);

  useEffect(() => {
    resetBuilder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formId]);

  // Auto-select the first question when the form loads.
  useEffect(() => {
    if (form && form.questions.length > 0 && !selectedQuestionId) {
      const sortedQuestions = [...form.questions].sort(
        (a, b) => a.order - b.order
      );

      const firstQuestion = sortedQuestions[0];

      if (firstQuestion) {
        selectQuestion(firstQuestion.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.id, form?.questions.length, selectedQuestionId]);

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="flex flex-1">
          <div className="w-72 border-r border-border p-4">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="flex-1 p-10">
            <Skeleton className="h-12 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <h1 className="text-xl font-bold">Form not found</h1>
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const selectedQuestion =
    form.questions.find((q) => q.id === selectedQuestionId) ?? null;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <BuilderTopbar form={form} />
      <div className="flex flex-1 overflow-hidden">
        <QuestionSidebar form={form} />

        <main className="no-scrollbar flex-1 overflow-y-auto">
          {selectedQuestion ? (
            <QuestionEditorPanel
              key={selectedQuestion.id}
              question={selectedQuestion}
              formId={form.id}
            />
          ) : (
            <EmptyBuilderState hasQuestions={form.questions.length > 0} />
          )}
        </main>

        <LivePreviewPanel form={form} />
      </div>
    </div>
  );
}