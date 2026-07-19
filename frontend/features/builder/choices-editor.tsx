"use client";

import { Plus, X, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Choice } from "@/types";

interface ChoicesEditorProps {
  choices: Choice[];
  onChange: (choices: Choice[]) => void;
}

export function ChoicesEditor({ choices, onChange }: ChoicesEditorProps) {
  function updateLabel(id: string, label: string) {
    onChange(choices.map((c) => (c.id === id ? { ...c, label } : c)));
  }

  function removeChoice(id: string) {
    onChange(choices.filter((c) => c.id !== id).map((c, idx) => ({ ...c, order: idx })));
  }

  function addChoice() {
    const newChoice: Choice = {
      id: `new-${Date.now()}`,
      label: `Option ${choices.length + 1}`,
      order: choices.length,
    };
    onChange([...choices, newChoice]);
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold">Options</label>
      <div className="space-y-2">
        {choices.map((choice, idx) => (
          <div key={choice.id} className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/50" />
            <span className="w-5 shrink-0 text-xs font-bold text-muted-foreground">{idx + 1}</span>
            <Input
              value={choice.label}
              onChange={(e) => updateLabel(choice.id, e.target.value)}
              placeholder={`Option ${idx + 1}`}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => removeChoice(choice.id)}
              disabled={choices.length <= 2}
              aria-label="Remove option"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={addChoice} className="gap-1.5 text-muted-foreground">
        <Plus className="h-3.5 w-3.5" /> Add option
      </Button>
    </div>
  );
}
