import { Card } from "@/components/ui/card";
import type { FormAnalytics } from "@/types";

export function AnalyticsSummaryCards({ analytics }: { analytics: FormAnalytics }) {
  const cards = [
    { label: "Total responses", value: analytics.total_responses },
    { label: "Completed", value: analytics.completed_responses },
    { label: "Completion rate", value: `${analytics.completion_rate}%` },
    { label: "Questions", value: analytics.question_stats.length },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{card.label}</p>
          <p className="mt-1 text-2xl font-extrabold">{card.value}</p>
        </Card>
      ))}
    </div>
  );
}
