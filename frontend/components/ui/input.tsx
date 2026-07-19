import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        // Browser extensions (password managers, autofill tools) inject
        // attributes like `fdprocessedid` onto <input> elements before React
        // hydrates, which makes React think the server and client HTML
        // mismatch even though nothing in the app actually differs. This is
        // a well-documented false positive (see the React hydration-error
        // docs), not a real bug — suppress it here rather than for every
        // input individually.
        suppressHydrationWarning
        className={cn(
          "focus-ring flex h-11 w-full rounded-xl border bg-background px-4 py-2 text-[15px] transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          error ? "border-destructive" : "border-input hover:border-foreground/30",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
