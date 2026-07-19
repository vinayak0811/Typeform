"use client";

import { X, ChevronLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressHeaderProps {
  currentStep: number; // 0-indexed question step, -1 = welcome
  totalSteps: number;
  onBack?: () => void;
  onExit?: () => void;
  showBack: boolean;
}

export function ProgressHeader({ currentStep, totalSteps, onBack, onExit, showBack }: ProgressHeaderProps) {
  const percent = totalSteps > 0 ? Math.max(0, Math.min(100, ((currentStep + 1) / totalSteps) * 100)) : 0;

  return (
    <div className="absolute inset-x-0 top-0 z-20 bg-background/80 backdrop-blur-sm">
      <Progress value={percent} className="h-1 rounded-none" />
      <div className="flex items-center justify-between px-5 py-3 sm:px-8">
        <button
          type="button"
          onClick={onBack}
          className={cn(
            "focus-ring flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-opacity hover:bg-secondary",
            showBack ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          aria-label="Previous question"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {currentStep >= 0 && currentStep < totalSteps && (
          <span className="text-xs font-semibold text-muted-foreground">
            {currentStep + 1} of {totalSteps} &middot; {Math.round(percent)}%
          </span>
        )}

        {onExit ? (
          <button
            type="button"
            onClick={onExit}
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
            aria-label="Exit"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <span className="w-9" />
        )}
      </div>
    </div>
  );
}
