"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getQuestionTypeMeta } from "@/utils/question-types";
import type { QuestionStat } from "@/types";

const BAR_COLOR = "hsl(243, 75%, 59%)";

export function QuestionStatCard({ stat }: { stat: QuestionStat }) {
  const meta = getQuestionTypeMeta(stat.type);
  const Icon = meta.icon;

  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
          <div>
            <h4 className="font-semibold leading-snug">{stat.title || "Untitled question"}</h4>
            <p className="text-xs text-muted-foreground">
              {stat.answered_count} answered &middot; {stat.skipped_count} skipped
            </p>
          </div>
        </div>
      </div>

      {stat.choice_distribution && stat.choice_distribution.length > 0 && (
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stat.choice_distribution} layout="vertical" margin={{ left: 0, right: 24 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                width={110}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#71717a" }}
              />
              <Tooltip
                cursor={{ fill: "hsl(240 5% 96%)" }}
                formatter={(value: number, _name, props) => [`${value} (${props.payload.percentage}%)`, "Responses"]}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={22}>
                {stat.choice_distribution.map((entry) => (
                  <Cell key={entry.choice_id} fill={BAR_COLOR} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {stat.average !== null && stat.average !== undefined && stat.type === "rating" && (
        <div className="flex items-center gap-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${i < Math.round(stat.average || 0) ? "fill-amber-400 text-amber-400" : "text-border"}`}
              />
            ))}
          </div>
          <span className="text-lg font-bold">{stat.average}</span>
          <span className="text-xs text-muted-foreground">
            (range {stat.min_value}–{stat.max_value})
          </span>
        </div>
      )}

      {stat.average !== null && stat.average !== undefined && stat.type === "number" && (
        <div className="flex items-baseline gap-4">
          <div>
            <p className="text-2xl font-extrabold">{stat.average}</p>
            <p className="text-xs text-muted-foreground">average</p>
          </div>
          <div className="text-xs text-muted-foreground">
            min {stat.min_value} &middot; max {stat.max_value}
          </div>
        </div>
      )}

      {stat.sample_answers && (
        <div className="space-y-2">
          {stat.sample_answers.length === 0 && <p className="text-sm text-muted-foreground">No answers yet.</p>}
          {stat.sample_answers.map((answer, idx) => (
            <p key={idx} className="rounded-lg bg-secondary/60 px-3 py-2 text-sm">
              &ldquo;{answer}&rdquo;
            </p>
          ))}
        </div>
      )}
    </Card>
  );
}
