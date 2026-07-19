"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, MoreHorizontal, Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getQuestionTypeMeta } from "@/utils/question-types";
import type { Question } from "@/types";

interface SortableQuestionItemProps {
  question: Question;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function SortableQuestionItem({
  question,
  index,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
}: SortableQuestionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });
  const meta = getQuestionTypeMeta(question.type);
  const Icon = meta.icon;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 rounded-xl border px-2 py-2 transition-colors",
        isDragging && "z-10 opacity-70 shadow-lg",
        isSelected ? "border-primary bg-accent" : "border-transparent hover:bg-secondary"
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="focus-ring cursor-grab touch-none rounded p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <button onClick={onSelect} className="focus-ring flex min-w-0 flex-1 items-center gap-2 text-left">
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold",
            isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          )}
        >
          {index + 1}
        </span>
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className={cn("truncate text-sm", isSelected ? "font-semibold" : "font-medium")}>
          {question.title || "Untitled question"}
        </span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="focus-ring rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary group-hover:opacity-100 data-[state=open]:opacity-100"
            aria-label="Question actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onDuplicate}>
            <Copy className="h-4 w-4" /> Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem destructive onClick={onDelete}>
            <Trash2 className="h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
