import Link from "next/link";
import { ArrowRight, Layers, MousePointerClick, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: MousePointerClick,
    title: "Drag-and-drop builder",
    body: "Add, reorder, and configure eight question types with autosave and a live preview that updates as you type.",
  },
  {
    icon: Layers,
    title: "One question at a time",
    body: "Respondents get a fullscreen, conversational experience with smooth transitions, keyboard navigation, and instant validation.",
  },
  {
    icon: BarChart3,
    title: "Responses & analytics",
    body: "Every submission lands in a searchable table, with completion rate, choice breakdowns, and per-question stats.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="glow-backdrop" aria-hidden="true" />

      {/* Corner nav: brand on the left, Login / Sign up on the right */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/" className="font-serif text-xl font-medium tracking-tight">
          Formly
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign up free</Link>
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <span className="eyebrow mb-5">Conversational forms, built fast</span>
        <h1 className="max-w-3xl font-serif text-4xl font-medium leading-tight tracking-tight sm:text-6xl">
          Forms people actually enjoy filling out
        </h1>
        <p className="mt-5 max-w-xl text-balance text-lg text-muted-foreground">
          Build a fullscreen, one-question-at-a-time form in minutes — then watch responses and
          analytics roll in.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup">
              Start building for free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">I already have an account</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Free to use. No credit card required. Sign-in is required to create or manage forms —
          the forms themselves stay open for anyone to fill out.
        </p>
      </main>

      {/* Features */}
      <section className="relative z-10 mx-auto grid w-full max-w-5xl grid-cols-1 gap-5 px-6 pb-20 sm:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="glow-card rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
