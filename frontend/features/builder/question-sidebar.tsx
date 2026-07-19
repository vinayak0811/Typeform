"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { SortableQuestionItem } from "./sortable-question-item";
import { AddQuestionMenu } from "./add-question-menu";
import { useBuilderStore } from "@/store/builder-store";
import {
  useCreateQuestion,
  useDeleteQuestion,
  useDuplicateQuestion,
  useReorderQuestions,
} from "@/hooks/use-questions";
import { getQuestionTypeMeta } from "@/utils/question-types";
import type { FormDetail, QuestionType } from "@/types";

export function QuestionSidebar({ form }: { form: FormDetail }) {
  const questions = [...form.questions].sort((a, b) => a.order - b.order);

  const selectedQuestionId = useBuilderStore((s) => s.selectedQuestionId);
  const selectQuestion = useBuilderStore((s) => s.selectQuestion);
  const setDragging = useBuilderStore((s) => s.setDragging);

  const createQuestion = useCreateQuestion(form.id);
  const deleteQuestion = useDeleteQuestion(form.id);
  const duplicateQuestion = useDuplicateQuestion(form.id);
  const reorderQuestions = useReorderQuestions(form.id);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleAdd(type: QuestionType) {
    const meta = getQuestionTypeMeta(type);

    createQuestion.mutate(
      {
        type,
        title: "",
        required: false,
        settings: meta.defaultSettings,
        choices: meta.hasChoices
          ? [
              {
                label: "Option 1",
                order: 0,
              },
              {
                label: "Option 2",
                order: 1,
              },
            ]
          : [],
      },
      {
        onSuccess: (question) => {
          selectQuestion(question.id);
        },
      }
    );
  }

  function handleDragStart() {
    setDragging(true);
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragging(false);

    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const reordered = [...questions];

    const [moved] = reordered.splice(oldIndex, 1);

    // ✅ Fix for strict TypeScript
    if (!moved) {
      return;
    }

    reordered.splice(newIndex, 0, moved);

    reorderQuestions.mutate(
      reordered.map((q, idx) => ({
        id: q.id,
        order: idx,
      }))
    );
  }

  function handleDelete(questionId: string) {
    deleteQuestion.mutate(questionId, {
      onSuccess: () => {
        if (selectedQuestionId === questionId) {
          selectQuestion(null);
        }
      },
    });
  }

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-secondary/40 p-3">
      <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Questions ({questions.length})
      </p>

      <div className="no-scrollbar flex-1 space-y-1 overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={questions.map((q) => q.id)}
            strategy={verticalListSortingStrategy}
          >
            {questions.map((question, index) => (
              <SortableQuestionItem
                key={question.id}
                question={question}
                index={index}
                isSelected={selectedQuestionId === question.id}
                onSelect={() => selectQuestion(question.id)}
                onDuplicate={() => duplicateQuestion.mutate(question.id)}
                onDelete={() => handleDelete(question.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div className="mt-2">
        <AddQuestionMenu onAdd={handleAdd} />
      </div>
    </aside>
  );
}