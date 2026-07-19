"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm as useReactHookForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/hooks/use-auth";

const forgotSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
});
type ForgotValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [debugToken, setDebugToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useReactHookForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: ForgotValues) {
    forgotPassword.mutate(values.email, {
      onSuccess: (res) => {
        setSubmittedMessage(res.message);
        setDebugToken(res.debug_reset_token);
      },
    });
  }

  if (submittedMessage) {
    return (
      <Card className="p-8 text-center shadow-glow">
        <h1 className="font-serif text-2xl font-medium tracking-tight">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">{submittedMessage}</p>

        {debugToken && (
          <div className="mt-6 rounded-xl border border-dashed border-border bg-secondary/50 p-4 text-left">
            <p className="text-xs font-medium text-muted-foreground">
              No email provider is configured in this project — here&apos;s your reset link for local testing:
            </p>
            <Link
              href={`/reset-password?token=${encodeURIComponent(debugToken)}`}
              className="mt-2 block truncate text-xs text-primary hover:underline"
            >
              /reset-password?token={debugToken.slice(0, 24)}…
            </Link>
          </div>
        )}

        <Link href="/login" className="mt-6 block text-sm font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-8 shadow-glow">
      <div className="mb-6 space-y-1.5 text-center">
        <h1 className="font-serif text-2xl font-medium tracking-tight">Forgot your password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to reset it.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={!!errors.email}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={forgotPassword.isPending}>
          {forgotPassword.isPending ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
