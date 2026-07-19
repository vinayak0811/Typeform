"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15 ring-1 ring-red-500/30">
        <AlertTriangle className="h-7 w-7 text-red-400" />
      </div>
      <h1 className="font-serif text-2xl font-medium">Something went wrong</h1>
      <p className="max-w-sm text-muted-foreground">
        An unexpected error occurred. You can try again, or head back to the dashboard.
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => reset()}>
          Try again
        </Button>
        <Button onClick={() => (window.location.href = "/dashboard")}>Back to dashboard</Button>
      </div>
    </div>
  );
}
