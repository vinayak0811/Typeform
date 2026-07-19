"use client";

import Link from "next/link";
import { Radio } from "lucide-react";
import { useForms } from "@/hooks/use-forms";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AppNav } from "@/components/app-nav";
import { PublishedFormCard } from "./published-form-card";

export function PublishedFormsPage() {
  const { data: forms, isLoading } = useForms({ sortBy: "updated_at", sortDir: "desc" });
  const published = forms?.filter((form) => form.status === "published") ?? [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
      <AppNav />

      <header className="mb-8 flex flex-col gap-2">
        <span className="eyebrow">Published forms</span>
        <h1 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl">Your live forms</h1>
        <p className="text-muted-foreground">
          Everything you&apos;ve published and shared — open to anyone with the link, no sign-in required.
        </p>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      ) : published.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
            <Radio className="h-6 w-6 text-accent-foreground" />
          </div>
          <h3 className="mt-4 font-serif text-lg font-medium">Nothing published yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Publish a form from My Forms to see it here, ready to share.
          </p>
          <Button asChild className="mt-5">
            <Link href="/dashboard">Go to My Forms</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {published.map((form, index) => (
            <PublishedFormCard key={form.id} form={form} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
