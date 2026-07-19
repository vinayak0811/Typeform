import { MousePointerClick } from "lucide-react";

export function EmptyBuilderState({ hasQuestions }: { hasQuestions: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
        <MousePointerClick className="h-6 w-6 text-accent-foreground" />
      </div>
      <h3 className="font-serif text-lg font-medium">{hasQuestions ? "Select a question to edit" : "Let's build your form"}</h3>
      <p className="max-w-xs text-sm text-muted-foreground">
        {hasQuestions
          ? "Choose a question from the list on the left."
          : "Click \"Add question\" in the sidebar to add your first question."}
      </p>
    </div>
  );
}
