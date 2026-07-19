"use client";

import { useEffect, useState } from "react";
import { Trash2, Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChoicesEditor } from "./choices-editor";
import { useUpdateQuestion, useDeleteQuestion, useDuplicateQuestion } from "@/hooks/use-questions";
import { useBuilderStore } from "@/store/builder-store";
import { useDebounce } from "@/hooks/use-debounce";
import { QUESTION_TYPES, getQuestionTypeMeta } from "@/utils/question-types";
import type { Choice, Question, QuestionType } from "@/types";

export function QuestionEditorPanel({ question, formId }: { question: Question; formId: string }) {
  const [title, setTitle] = useState(question.title);
  const [description, setDescription] = useState(question.description || "");
  const [required, setRequired] = useState(question.required);
  const [choices, setChoices] = useState<Choice[]>(question.choices);
  const [maxRating, setMaxRating] = useState<number>((question.settings?.max_rating as number) || 5);
  const [placeholder, setPlaceholder] = useState((question.settings?.placeholder as string) || "");

  const updateQuestion = useUpdateQuestion(formId);
  const deleteQuestion = useDeleteQuestion(formId);
  const duplicateQuestion = useDuplicateQuestion(formId);
  const selectQuestion = useBuilderStore((s) => s.selectQuestion);
  const setAutosaveStatus = useBuilderStore((s) => s.setAutosaveStatus);

  const meta = getQuestionTypeMeta(question.type);

  // Reset local editing state whenever the selected question changes.
  useEffect(() => {
    setTitle(question.title);
    setDescription(question.description || "");
    setRequired(question.required);
    setChoices(question.choices);
    setMaxRating((question.settings?.max_rating as number) || 5);
    setPlaceholder((question.settings?.placeholder as string) || "");
  }, [question.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const debouncedTitle = useDebounce(title, 500);
  const debouncedDescription = useDebounce(description, 500);
  const debouncedChoices = useDebounce(choices, 600);
  const debouncedPlaceholder = useDebounce(placeholder, 600);

  function persist(data: Parameters<typeof updateQuestion.mutate>[0]["data"]) {
    setAutosaveStatus("saving");
    updateQuestion.mutate(
      { questionId: question.id, data },
      {
        onSuccess: () => setAutosaveStatus("saved"),
        onError: () => setAutosaveStatus("error"),
      }
    );
  }

  useEffect(() => {
    if (debouncedTitle !== question.title) persist({ title: debouncedTitle });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTitle]);

  useEffect(() => {
    if (debouncedDescription !== (question.description || "")) persist({ description: debouncedDescription });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDescription]);

  useEffect(() => {
    const changed = JSON.stringify(debouncedChoices.map((c) => c.label)) !== JSON.stringify(question.choices.map((c) => c.label));
    if (meta.hasChoices && changed) {
      persist({ choices: debouncedChoices.map((c, idx) => ({ label: c.label, order: idx })) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedChoices]);

  useEffect(() => {
    if (debouncedPlaceholder !== ((question.settings?.placeholder as string) || "")) {
      persist({ settings: { ...question.settings, placeholder: debouncedPlaceholder } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPlaceholder]);

  function handleRequiredToggle(value: boolean) {
    setRequired(value);
    persist({ required: value });
  }

  function handleTypeChange(type: QuestionType) {
    const newMeta = getQuestionTypeMeta(type);
    persist({
      type,
      settings: newMeta.defaultSettings,
      choices: newMeta.hasChoices ? [{ label: "Option 1", order: 0 }, { label: "Option 2", order: 1 }] : [],
    });
  }

  function handleMaxRatingChange(value: number) {
    const clamped = Math.min(10, Math.max(3, value));
    setMaxRating(clamped);
    persist({ settings: { ...question.settings, max_rating: clamped } });
  }

  function handleDelete() {
    deleteQuestion.mutate(question.id, { onSuccess: () => selectQuestion(null) });
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6 sm:p-10">
      <div className="flex items-center justify-between">
        <Select value={question.type} onValueChange={(v) => handleTypeChange(v as QuestionType)}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_TYPES.map((t) => (
              <SelectItem key={t.type} value={t.type}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => duplicateQuestion.mutate(question.id)} aria-label="Duplicate question">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDelete} className="text-muted-foreground hover:text-destructive" aria-label="Delete question">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <Textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Type your question here..."
          className="min-h-[3rem] resize-none border-0 bg-transparent px-0 text-2xl font-bold leading-snug focus-visible:ring-0"
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description (optional)"
          className="min-h-[2.5rem] resize-none border-0 bg-transparent px-0 text-base text-muted-foreground focus-visible:ring-0"
        />
      </div>

      {meta.hasChoices && <ChoicesEditor choices={choices} onChange={setChoices} />}

      {question.type === "rating" && (
        <div className="space-y-2">
          <Label>Maximum rating</Label>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => handleMaxRatingChange(maxRating - 1)} disabled={maxRating <= 3}>
              -
            </Button>
            <span className="w-8 text-center text-sm font-bold">{maxRating}</span>
            <Button variant="outline" size="icon" onClick={() => handleMaxRatingChange(maxRating + 1)} disabled={maxRating >= 10}>
              +
            </Button>
          </div>
        </div>
      )}

      {["short_text", "long_text", "email", "number"].includes(question.type) && (
        <div className="space-y-2">
          <Label>Placeholder text</Label>
          <Input value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} placeholder="Type your answer here..." />
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
        <Label htmlFor="required-toggle" className="cursor-pointer">
          Required question
        </Label>
        <Switch id="required-toggle" checked={required} onCheckedChange={handleRequiredToggle} />
      </div>
    </div>
  );
}
