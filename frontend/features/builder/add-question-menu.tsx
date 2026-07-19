"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QUESTION_TYPES } from "@/utils/question-types";
import type { QuestionType } from "@/types";

export function AddQuestionMenu({ onAdd }: { onAdd: (type: QuestionType) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-center gap-2 border-dashed">
          <Plus className="h-4 w-4" /> Add question
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Question type</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {QUESTION_TYPES.map((meta) => {
          const Icon = meta.icon;
          return (
            <DropdownMenuItem key={meta.type} onClick={() => onAdd(meta.type)}>
              <Icon className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span>{meta.label}</span>
                <span className="text-xs font-normal text-muted-foreground">{meta.description}</span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
