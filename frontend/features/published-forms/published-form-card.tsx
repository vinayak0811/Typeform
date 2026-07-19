"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, LinkIcon, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime, pluralize } from "@/utils/format";
import type { FormListItem } from "@/types";

export function PublishedFormCard({ form, index }: { form: FormListItem; index: number }) {
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
      <Card className="glow-card flex h-56 flex-col justify-between p-5 transition-all hover:-translate-y-0.5">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <Badge variant="success">Published</Badge>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5" />
              {pluralize(form.response_count, "response")}
            </span>
          </div>
          <h3 className="line-clamp-2 text-lg font-bold leading-snug">{form.title || "Untitled Form"}</h3>
          {form.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{form.description}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">Updated {formatRelativeTime(form.updated_at)}</span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyLink} aria-label="Copy public link">
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild aria-label="Open live form">
              <a href={`/f/${form.id}`} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/forms/${form.id}/responses`}>Responses</Link>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
