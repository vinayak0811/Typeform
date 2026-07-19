import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      {/* Decorative glow blobs live in their own layer so pointer-events: none
          (which is inherited by descendants) never reaches the real content. */}
      <div className="glow-backdrop" aria-hidden="true" />

      <Link href="/" className="relative z-10 mb-8 font-serif text-2xl font-medium tracking-tight">
        Formly
      </Link>
      <div className="relative z-10 w-full max-w-[400px] animate-fade-up">{children}</div>
    </div>
  );
}
