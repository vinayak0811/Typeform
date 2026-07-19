"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WelcomeScreen({
  title,
  description,
  questionCount,
  onStart,
}: {
  title: string;
  description?: string | null;
  questionCount: number;
  onStart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto flex w-full max-w-2xl flex-col items-start gap-6 px-6 sm:px-0"
    >
      <h1 className="font-serif text-3xl font-medium leading-tight sm:text-5xl">{title}</h1>
      {description ? <p className="max-w-xl text-lg text-muted-foreground">{description}</p> : null}

      <div className="flex items-center gap-4">
        <Button size="lg" onClick={onStart} className="gap-2">
          Start <ArrowRight className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          {questionCount} question{questionCount === 1 ? "" : "s"} &middot; takes about {Math.max(1, Math.ceil(questionCount * 0.25))} min
        </span>
      </div>
    </motion.div>
  );
}

export function ThankYouScreen({ title = "Thanks for completing this form!" }: { title?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto flex w-full max-w-xl flex-col items-center gap-5 px-6 text-center sm:px-0"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 14 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30"
      >
        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
      </motion.div>
      <h1 className="font-serif text-2xl font-medium sm:text-3xl">{title}</h1>
      <p className="text-muted-foreground">Your response has been recorded. You may now close this window.</p>
    </motion.div>
  );
}
