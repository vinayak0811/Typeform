import { FileQuestion } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-56 w-full" />
      ))}
    </div>
  );
}

export function DashboardEmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
        <FileQuestion className="h-6 w-6 text-accent-foreground" />
      </div>
      <h3 className="mt-4 font-serif text-lg font-medium">{hasSearch ? "No forms match your search" : "No forms yet"}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {hasSearch
          ? "Try a different search term or clear the search box."
          : "Create your first form to start collecting responses."}
      </p>
    </div>
  );
}
