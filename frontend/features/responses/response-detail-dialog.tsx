"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useResponseDetail } from "@/hooks/use-responses";
import { useResponsesStore } from "@/store/responses-store";
import { useForm } from "@/hooks/use-forms";
import { formatDateTime } from "@/utils/format";

export function ResponseDetailDialog({ formId }: { formId: string }) {
  const selectedResponseId = useResponsesStore((s) => s.selectedResponseId);
  const selectResponse = useResponsesStore((s) => s.selectResponse);
  const { data: response, isLoading } = useResponseDetail(formId, selectedResponseId);
  const { data: form } = useForm(formId);

  const questionsById = new Map((form?.questions || []).map((q) => [q.id, q]));

  return (
    <Dialog open={!!selectedResponseId} onOpenChange={(open) => !open && selectResponse(null)}>
      <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Response detail</DialogTitle>
          <DialogDescription>
            {response ? `Submitted ${formatDateTime(response.submitted_at)}` : "Loading..."}
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        )}

        {response && (
          <div className="space-y-4">
            {response.answers.map((answer) => {
              const question = questionsById.get(answer.question_id);
              const choiceLabel = question?.choices.find((c) => c.id === answer.choice_id)?.label;
              const displayValue =
                choiceLabel ?? answer.value_text ?? (answer.value_number !== null ? String(answer.value_number) : "—");

              return (
                <div key={answer.id} className="rounded-xl border border-border p-3.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {question?.title || "Question"}
                  </p>
                  <p className="mt-1 text-sm font-medium">{displayValue || "—"}</p>
                </div>
              );
            })}
            {response.answers.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No answers were recorded.</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
