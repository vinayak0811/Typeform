"use client";

import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "@/hooks/use-forms";
import { ResponsesTable } from "./responses-table";
import { ResponseDetailDialog } from "./response-detail-dialog";
import { AnalyticsView } from "./analytics-view";

export function ResponsesPage({ formId }: { formId: string }) {
  const { data: form, isLoading, isError } = useForm(formId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 text-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
        <h1 className="font-serif text-xl font-medium">Form not found</h1>
        <Link href="/dashboard" className="text-sm font-semibold text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
      <div className="mb-8 flex items-center gap-3">
        <Link
          href={`/forms/${form.id}/builder`}
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
        >
          <ArrowLeft className="h-[18px] w-[18px]" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-tight">{form.title}</h1>
          <p className="text-sm text-muted-foreground">Responses and analytics</p>
        </div>
      </div>

      <Tabs defaultValue="submissions">
        <TabsList>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          <ResponsesTable formId={formId} />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsView formId={formId} />
        </TabsContent>
      </Tabs>

      <ResponseDetailDialog formId={formId} />
    </div>
  );
}
