"use client";

import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/utils/format";
import { useResponses } from "@/hooks/use-responses";
import { useResponsesStore } from "@/store/responses-store";
import { useDebounce } from "@/hooks/use-debounce";
import { useEffect, useState } from "react";

export function ResponsesTable({ formId }: { formId: string }) {
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const page = useResponsesStore((s) => s.page);
  const pageSize = useResponsesStore((s) => s.pageSize);
  const setPage = useResponsesStore((s) => s.setPage);
  const setSearch = useResponsesStore((s) => s.setSearch);
  const selectResponse = useResponsesStore((s) => s.selectResponse);

  useEffect(() => setSearch(debouncedSearch), [debouncedSearch, setSearch]);

  const { data, isLoading } = useResponses(formId, page, pageSize, debouncedSearch);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search responses..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="max-w-xs"
      />

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3" colSpan={3}>
                    <Skeleton className="h-6 w-full" />
                  </td>
                </tr>
              ))}

            {!isLoading && data?.items.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">
                  No responses yet.
                </td>
              </tr>
            )}

            {!isLoading &&
              data?.items.map((response) => (
                <tr key={response.id} className="transition-colors hover:bg-secondary/40">
                  <td className="px-4 py-3">
                    {response.completed ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-muted-foreground">
                        <Circle className="h-3 w-3" /> Partial
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(response.submitted_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => selectResponse(response.id)}>
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {data.page} of {data.total_pages} &middot; {data.total} total
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= data.total_pages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
