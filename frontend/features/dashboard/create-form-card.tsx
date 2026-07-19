"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useCreateForm } from "@/hooks/use-forms";

export function CreateFormCard() {
  const router = useRouter();
  const createForm = useCreateForm();

  function handleCreate() {
    createForm.mutate(
      { title: "Untitled Form", description: "" },
      {
        onSuccess: (form) => router.push(`/forms/${form.id}/builder`),
      }
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onClick={handleCreate}
      disabled={createForm.isPending}
      className="focus-ring flex h-56 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border text-muted-foreground transition-all hover:border-primary hover:bg-accent hover:text-primary disabled:opacity-60"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
        <Plus className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold">{createForm.isPending ? "Creating..." : "Create a new form"}</span>
    </motion.button>
  );
}
