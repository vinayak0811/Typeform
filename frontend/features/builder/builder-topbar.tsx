"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, Link as LinkIcon, ExternalLink, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUpdateForm, usePublishForm, useUnpublishForm } from "@/hooks/use-forms";
import { useBuilderStore } from "@/store/builder-store";
import { useDebounce } from "@/hooks/use-debounce";
import type { FormDetail } from "@/types";

export function BuilderTopbar({ form }: { form: FormDetail }) {
  const [title, setTitle] = useState(form.title);
  const debouncedTitle = useDebounce(title, 600);
  const updateForm = useUpdateForm(form.id);
  const publishForm = usePublishForm();
  const unpublishForm = useUnpublishForm();
  const autosaveStatus = useBuilderStore((s) => s.autosaveStatus);
  const setAutosaveStatus = useBuilderStore((s) => s.setAutosaveStatus);

  useEffect(() => setTitle(form.title), [form.id, form.title]);

  useEffect(() => {
    if (debouncedTitle === form.title || !debouncedTitle.trim()) return;
    setAutosaveStatus("saving");
    updateForm.mutate(
      { title: debouncedTitle.trim() },
      {
        onSuccess: () => setAutosaveStatus("saved"),
        onError: () => setAutosaveStatus("error"),
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTitle]);

  function copyPublicLink() {
    const url = `${window.location.origin}/f/${form.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Public link copied");
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/dashboard"
          className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </Link>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="focus-ring min-w-0 max-w-xs truncate rounded-lg border border-transparent bg-transparent px-2 py-1 text-base font-bold hover:border-border focus:border-border sm:max-w-sm"
          aria-label="Form title"
        />
        <Badge variant={form.status === "published" ? "success" : "outline"} className="hidden sm:flex">
          {form.status === "published" ? "Published" : "Draft"}
        </Badge>

        <AutosaveIndicator status={autosaveStatus} />
      </div>

      <div className="flex items-center gap-2">
        <Link href={`/forms/${form.id}/responses`}>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <BarChart3 className="h-4 w-4" /> Responses
          </Button>
        </Link>

        {form.status === "published" && (
          <>
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={copyPublicLink}>
              <LinkIcon className="h-4 w-4" /> Copy link
            </Button>
            <a href={`/f/${form.id}`} target="_blank" rel="noreferrer">
              <Button variant="ghost" size="icon">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </>
        )}

        {form.status === "published" ? (
          <Button variant="outline" size="sm" onClick={() => unpublishForm.mutate(form.id)}>
            Unpublish
          </Button>
        ) : (
          <Button size="sm" onClick={() => publishForm.mutate(form.id)} disabled={publishForm.isPending}>
            Publish
          </Button>
        )}
      </div>
    </header>
  );
}

function AutosaveIndicator({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  if (status === "idle") return null;
  return (
    <span className="hidden items-center gap-1 text-xs font-medium text-muted-foreground md:flex">
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" /> Saving...
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="h-3 w-3 text-emerald-400" /> Saved
        </>
      )}
      {status === "error" && <span className="text-destructive">Failed to save</span>}
    </span>
  );
}
