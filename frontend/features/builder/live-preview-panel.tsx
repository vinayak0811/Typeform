"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationalForm } from "@/features/public-form/conversational-form";
import { usePreviewStore } from "@/store/preview-store";
import type { FormDetail } from "@/types";

export function LivePreviewPanel({ form }: { form: FormDetail }) {
  const reset = usePreviewStore((s) => s.reset);

  return (
    <aside className="hidden h-full w-[420px] shrink-0 flex-col border-l border-border bg-secondary/30 lg:flex">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Live preview</span>
        <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs" onClick={() => reset()}>
          <RotateCcw className="h-3 w-3" /> Restart
        </Button>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden p-4">
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border bg-background shadow-inner">
          <div className="no-scrollbar h-full overflow-y-auto">
            {form.questions.length > 0 ? (
              <ConversationalForm form={form} mode="preview" />
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
                Add a question to see the live preview.
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
