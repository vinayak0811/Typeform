"use client";

import { useFormAnalytics } from "@/hooks/use-responses";
import { Skeleton } from "@/components/ui/skeleton";
import { AnalyticsSummaryCards } from "./analytics-summary-cards";
import { QuestionStatCard } from "./question-stat-card";

export function AnalyticsView({ formId }: { formId: string }) {
  const { data: analytics, isLoading } = useFormAnalytics(formId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!analytics) return null;

  if (analytics.total_responses === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
        <h3 className="font-serif text-lg font-medium">No data yet</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Analytics will appear here once your form starts receiving responses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnalyticsSummaryCards analytics={analytics} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {analytics.question_stats.map((stat) => (
          <QuestionStatCard key={stat.question_id} stat={stat} />
        ))}
      </div>
    </div>
  );
}
