"use client";

import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionField, type AnswerValue } from "./question-field";
import type { Question } from "@/types";

interface ConversationalQuestionProps {
  question: Question;
  index: number;
  value: AnswerValue | undefined;
  error?: string;
  direction: 1 | -1;
  isLast: boolean;
  onChange: (value: AnswerValue) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const variants = {
  enter: (direction: 1 | -1) => ({ opacity: 0, y: direction > 0 ? 24 : -24 }),
  center: { opacity: 1, y: 0 },
  exit: (direction: 1 | -1) => ({ opacity: 0, y: direction > 0 ? -24 : 24 }),
};

export function ConversationalQuestion({
  question,
  index,
  value,
  error,
  direction,
  isLast,
  onChange,
  onNext,
  onPrevious,
}: ConversationalQuestionProps) {
  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 sm:px-0"
    >
      <div>
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
          <span>{index + 1}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
        <h2 className="text-2xl font-bold leading-snug sm:text-3xl">
          {question.title}
          {question.required && <span className="ml-1.5 text-primary">*</span>}
        </h2>
        {question.description ? (
          <p className="mt-2 text-base text-muted-foreground">{question.description}</p>
        ) : null}
      </div>

      <QuestionField
        question={question}
        value={value}
        onChange={onChange}
        onSubmitEnter={onNext}
        autoFocus
      />

      {error ? (
        <motion.p
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm font-medium text-destructive"
        >
          {error}
        </motion.p>
      ) : null}

      <div className="mt-2 flex items-center gap-3">
        <Button onClick={onNext} size="lg" className="gap-2">
          {isLast ? "Submit" : "OK"}
          <ArrowRight className="h-4 w-4" />
        </Button>
        {index > 0 && (
          <Button onClick={onPrevious} variant="ghost" size="lg" className="gap-1.5 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        )}
        <span className="hidden text-xs text-muted-foreground sm:inline">press <strong>Enter ↵</strong></span>
      </div>
    </motion.div>
  );
}
