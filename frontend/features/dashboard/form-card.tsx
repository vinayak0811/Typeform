"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MoreHorizontal, Copy, Pencil, Trash2, ExternalLink, Link as LinkIcon, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime, pluralize } from "@/utils/format";
import { useDuplicateForm, usePublishForm, useUnpublishForm } from "@/hooks/use-forms";
import { useUIStore } from "@/store/ui-store";
import type { FormListItem } from "@/types";

export function FormCard({ form, index }: { form: FormListItem; index: number }) {
  const duplicateForm = useDuplicateForm();
  const publishForm = usePublishForm();
  const unpublishForm = useUnpublishForm();
  const openDeleteDialog = useUIStore((s) => s.openDeleteFormDialog);
  const openRenameDialog = useUIStore((s) => s.openRenameFormDialog);

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/f/${form.id}` : "";

  function copyLink() {
    navigator.clipboard.writeText(publicUrl);
    toast.success("Public link copied to clipboard");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3), ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="glow-card group relative flex h-56 flex-col justify-between overflow-hidden p-5 transition-all hover:-translate-y-0.5">
        <Link href={`/forms/${form.id}/builder`} className="absolute inset-0 z-0" aria-label={`Edit ${form.title}`} />

        <div className="relative z-10 flex items-start justify-between">
          <Badge variant={form.status === "published" ? "success" : "outline"}>
            {form.status === "published" ? "Published" : "Draft"}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative z-10 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => openRenameDialog(form.id)}>
                <Pencil className="h-4 w-4" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => duplicateForm.mutate(form.id)}>
                <Copy className="h-4 w-4" /> Duplicate
              </DropdownMenuItem>
              {form.status === "published" ? (
                <>
                  <DropdownMenuItem onClick={copyLink}>
                    <LinkIcon className="h-4 w-4" /> Copy public link
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={`/f/${form.id}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" /> Open live form
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => unpublishForm.mutate(form.id)}>Unpublish</DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => publishForm.mutate(form.id)}>Publish</DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onClick={() => openDeleteDialog(form.id)}>
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative z-10">
          <h3 className="line-clamp-2 text-lg font-bold leading-snug">{form.title || "Untitled Form"}</h3>
          {form.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{form.description}</p>
          ) : null}
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BarChart3 className="h-3.5 w-3.5" />
            {pluralize(form.response_count, "response")}
          </span>
          <span>Updated {formatRelativeTime(form.updated_at)}</span>
        </div>
      </Card>
    </motion.div>
  );
}
