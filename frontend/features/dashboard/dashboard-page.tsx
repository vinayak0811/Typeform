"use client";

import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useForms } from "@/hooks/use-forms";
import { DashboardToolbar } from "./dashboard-toolbar";
import { DashboardGridSkeleton, DashboardEmptyState } from "./dashboard-states";
import { FormCard } from "./form-card";
import { CreateFormCard } from "./create-form-card";
import { RenameFormDialog, DeleteFormDialog } from "./form-dialogs";
import { AppNav } from "@/components/app-nav";

export function DashboardPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");
  const debouncedSearch = useDebounce(search, 300);

  const { data: forms, isLoading } = useForms({
    search: debouncedSearch,
    sortBy: sortBy as "title" | "created_at" | "updated_at" | "status",
    sortDir: sortBy === "title" ? "asc" : "desc",
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
      <AppNav />

      <header className="mb-8 flex flex-col gap-2">
        <span className="eyebrow">My forms</span>
        <h1 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl">Your forms</h1>
        <p className="text-muted-foreground">Create, manage, and analyze your forms in one place.</p>
      </header>

      <div className="mb-6">
        <DashboardToolbar search={search} onSearchChange={setSearch} sortBy={sortBy} onSortByChange={setSortBy} />
      </div>

      {isLoading ? (
        <DashboardGridSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <CreateFormCard />
          {forms?.map((form, index) => (
            <FormCard key={form.id} form={form} index={index} />
          ))}
        </div>
      )}

      {!isLoading && forms?.length === 0 && <div className="mt-5"><DashboardEmptyState hasSearch={!!debouncedSearch} /></div>}

      <RenameFormDialog />
      <DeleteFormDialog />
    </div>
  );
}
