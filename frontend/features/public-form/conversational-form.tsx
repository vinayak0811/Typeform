"use client";

import { useCallback, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { usePreviewStore } from "@/store/preview-store";
import { ProgressHeader } from "./progress-header";
import { ConversationalQuestion } from "./conversational-question";
import { WelcomeScreen, ThankYouScreen } from "./welcome-thank-you";
import { validateAnswer } from "./validation";
import type { AnswerSubmit, PublicForm, FormDetail } from "@/types";

interface ConversationalFormProps {
  form: PublicForm | FormDetail;
  mode: "live" | "preview";
  onSubmit?: (answers: AnswerSubmit[]) => void;
  isSubmitting?: boolean;
  submitError?: string | null;
  onExit?: () => void;
}

export function ConversationalForm({ form, mode, onSubmit, isSubmitting, submitError, onExit }: ConversationalFormProps) {
  const questions = useMemo(() => [...form.questions].sort((a, b) => a.order - b.order), [form.questions]);
  const totalSteps = questions.length;

  const currentStep = usePreviewStore((s) => s.currentStep);
  const direction = usePreviewStore((s) => s.direction);
  const answers = usePreviewStore((s) => s.answers);
  const fieldErrors = usePreviewStore((s) => s.fieldErrors);
  const goNext = usePreviewStore((s) => s.goNext);
  const goPrevious = usePreviewStore((s) => s.goPrevious);
  const goToStep = usePreviewStore((s) => s.goToStep);
  const setAnswer = usePreviewStore((s) => s.setAnswer);
  const setFieldError = usePreviewStore((s) => s.setFieldError);
  const reset = usePreviewStore((s) => s.reset);

  // Reset the runtime whenever we switch to a different form (e.g. builder preview after adding a question).
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.id]);

  const currentQuestion = currentStep >= 0 && currentStep < totalSteps ? questions[currentStep] : null;

  const handleNext = useCallback(() => {
    if (currentQuestion) {
      const error = validateAnswer(currentQuestion, answers[currentQuestion.id]);
      if (error) {
        setFieldError(currentQuestion.id, error);
        return;
      }
    }

    if (currentStep === totalSteps - 1) {
      // Last question -> submit.
      const payload: AnswerSubmit[] = questions.map((q) => ({
        question_id: q.id,
        value_text: answers[q.id]?.value_text ?? null,
        value_number: answers[q.id]?.value_number ?? null,
        choice_id: answers[q.id]?.choice_id ?? null,
      }));
      if (mode === "live" && onSubmit) {
        onSubmit(payload);
      } else {
        goNext(totalSteps); // preview mode just advances to the thank-you screen
      }
      return;
    }

    goNext(totalSteps);
  }, [currentQuestion, currentStep, totalSteps, answers, questions, mode, onSubmit, goNext, setFieldError]);

  const handlePrevious = useCallback(() => goPrevious(), [goPrevious]);

  // Keyboard navigation: Enter is handled inside inputs (QuestionField); arrows work globally.
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (currentStep < 0 || currentStep >= totalSteps) return;
      const target = e.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);

      if (e.key === "ArrowDown" && !isTyping) {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowUp" && !isTyping) {
        e.preventDefault();
        handlePrevious();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentStep, totalSteps, handleNext, handlePrevious]);

  const showThankYou = currentStep >= totalSteps;

  return (
    <div className={mode === "live" ? "relative flex min-h-screen w-full flex-col bg-background" : "relative flex h-full w-full flex-col bg-background"}>
      <ProgressHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        showBack={currentStep > 0 && currentStep < totalSteps}
        onBack={handlePrevious}
        onExit={onExit}
      />

      <div className="flex flex-1 items-center justify-center py-24">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          {currentStep === -1 && (
            <WelcomeScreen
              key="welcome"
              title={form.title}
              description={form.description}
              questionCount={totalSteps}
              onStart={() => goToStep(0)}
            />
          )}

          {currentQuestion && (
            <ConversationalQuestion
              key={currentQuestion.id}
              question={currentQuestion}
              index={currentStep}
              value={answers[currentQuestion.id]}
              error={fieldErrors[currentQuestion.id]}
              direction={direction}
              isLast={currentStep === totalSteps - 1}
              onChange={(value) => setAnswer(currentQuestion.id, value)}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {showThankYou && <ThankYouScreen key="thank-you" />}
        </AnimatePresence>
      </div>

      {isSubmitting && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <span className="text-sm font-semibold text-muted-foreground">Submitting your response...</span>
        </div>
      )}
      {submitError && (
        <div className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-lg">
          {submitError}
        </div>
      )}
    </div>
  );
}
