"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Question } from "@/types";

export interface AnswerValue {
  value_text?: string | null;
  value_number?: number | null;
  choice_id?: string | null;
}

interface QuestionFieldProps {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  onSubmitEnter: () => void;
  autoFocus?: boolean;
}

const OPTION_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function QuestionField({ question, value, onChange, onSubmitEnter, autoFocus }: QuestionFieldProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus, question.id]);

  switch (question.type) {
    case "short_text":
    case "email":
      return (
        <Input
          ref={inputRef as React.Ref<HTMLInputElement>}
          type={question.type === "email" ? "email" : "text"}
          value={value?.value_text ?? ""}
          placeholder={(question.settings?.placeholder as string) || "Type your answer here..."}
          onChange={(e) => onChange({ value_text: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmitEnter();
            }
          }}
          className="h-14 border-0 border-b-2 border-border bg-transparent px-1 text-2xl font-medium rounded-none focus-visible:border-primary focus:ring-0"
        />
      );

    case "long_text":
      return (
        <Textarea
          ref={inputRef as React.Ref<HTMLTextAreaElement>}
          value={value?.value_text ?? ""}
          placeholder={(question.settings?.placeholder as string) || "Type your answer here..."}
          onChange={(e) => onChange({ value_text: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              onSubmitEnter();
            }
          }}
          rows={4}
          className="border-0 border-b-2 border-border bg-transparent px-1 text-xl rounded-none focus-visible:border-primary focus:ring-0"
        />
      );

    case "number":
      return (
        <Input
          ref={inputRef as React.Ref<HTMLInputElement>}
          type="number"
          value={value?.value_number ?? ""}
          placeholder={(question.settings?.placeholder as string) || "0"}
          onChange={(e) => onChange({ value_number: e.target.value === "" ? null : Number(e.target.value) })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmitEnter();
            }
          }}
          className="h-14 border-0 border-b-2 border-border bg-transparent px-1 text-2xl font-medium rounded-none focus-visible:border-primary focus:ring-0"
        />
      );

    case "multiple_choice":
      return (
        <div className="flex flex-col gap-3">
          {question.choices.map((choice, idx) => {
            const selected = value?.choice_id === choice.id;
            return (
              <button
                key={choice.id}
                type="button"
                onClick={() => onChange({ choice_id: choice.id })}
                className={cn(
                  "focus-ring flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-lg font-medium transition-all",
                  selected
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border hover:border-foreground/30 hover:bg-secondary"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border-2 text-sm font-bold",
                    selected ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
                  )}
                >
                  {OPTION_LETTERS[idx] || idx + 1}
                </span>
                {choice.label}
              </button>
            );
          })}
        </div>
      );

    case "dropdown":
      return (
        <select
          value={value?.choice_id ?? ""}
          onChange={(e) => onChange({ choice_id: e.target.value })}
          className="focus-ring h-14 w-full rounded-xl border-2 border-border bg-transparent px-4 text-xl font-medium"
        >
          <option value="" disabled>
            Choose an option...
          </option>
          {question.choices.map((choice) => (
            <option key={choice.id} value={choice.id}>
              {choice.label}
            </option>
          ))}
        </select>
      );

    case "yes_no":
      return (
        <div className="flex gap-4">
          {(["yes", "no"] as const).map((option) => {
            const selected = value?.value_text === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onChange({ value_text: option })}
                className={cn(
                  "focus-ring flex flex-1 items-center justify-center gap-2 rounded-xl border-2 px-6 py-5 text-lg font-bold capitalize transition-all",
                  selected
                    ? "border-primary bg-accent text-accent-foreground"
                    : "border-border hover:border-foreground/30 hover:bg-secondary"
                )}
              >
                {selected && <Check className="h-5 w-5" />}
                {option}
              </button>
            );
          })}
        </div>
      );

    case "rating": {
      const max = (question.settings?.max_rating as number) || 5;
      const current = value?.value_number ?? 0;
      return (
        <div className="flex gap-2">
          {Array.from({ length: max }).map((_, idx) => {
            const ratingValue = idx + 1;
            const filled = ratingValue <= current;
            return (
              <button
                key={idx}
                type="button"
                aria-label={`Rate ${ratingValue} out of ${max}`}
                onClick={() => onChange({ value_number: ratingValue })}
                className="focus-ring rounded-lg p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={cn("h-9 w-9 transition-colors", filled ? "fill-primary text-primary" : "text-border")}
                />
              </button>
            );
          })}
        </div>
      );
    }

    default:
      return null;
  }
}
