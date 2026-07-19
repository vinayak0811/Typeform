import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "focus-ring flex min-h-[90px] w-full rounded-xl border bg-background px-4 py-3 text-[15px] transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-destructive" : "border-input hover:border-foreground/30",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
