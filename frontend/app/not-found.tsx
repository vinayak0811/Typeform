import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
        <FileQuestion className="h-7 w-7 text-accent-foreground" />
      </div>
      <h1 className="font-serif text-2xl font-medium">Page not found</h1>
      <p className="max-w-sm text-muted-foreground">The page you're looking for doesn't exist or may have been moved.</p>
      <Link href="/dashboard">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
