"use client";

import { useEffect } from "react";
import { useForm as useReactHookForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUIStore } from "@/store/ui-store";
import { useForms, useUpdateForm, useDeleteForm } from "@/hooks/use-forms";

const renameSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255, "Title is too long"),
});
type RenameFormValues = z.infer<typeof renameSchema>;

export function RenameFormDialog() {
  const formId = useUIStore((s) => s.renameFormDialogId);
  const close = useUIStore((s) => s.closeRenameFormDialog);
  const { data: forms } = useForms();
  const form = forms?.find((f) => f.id === formId);
  const updateForm = useUpdateForm(formId || "");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useReactHookForm<RenameFormValues>({
    resolver: zodResolver(renameSchema),
    defaultValues: { title: "" },
  });

  useEffect(() => {
    if (form) reset({ title: form.title });
  }, [form, reset]);

  function onSubmit(values: RenameFormValues) {
    if (!formId) return;
    updateForm.mutate({ title: values.title }, { onSuccess: () => close() });
  }

  return (
    <Dialog open={!!formId} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Rename form</DialogTitle>
            <DialogDescription>Give your form a clear, descriptive title.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rename-title">Title</Label>
            <Input id="rename-title" {...register("title")} error={!!errors.title} autoFocus />
            {errors.title && <p className="text-sm font-medium text-destructive">{errors.title.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateForm.isPending}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteFormDialog() {
  const formId = useUIStore((s) => s.deleteFormDialogId);
  const close = useUIStore((s) => s.closeDeleteFormDialog);
  const { data: forms } = useForms();
  const form = forms?.find((f) => f.id === formId);
  const deleteForm = useDeleteForm();

  function handleDelete() {
    if (!formId) return;
    deleteForm.mutate(formId, { onSuccess: () => close() });
  }

  return (
    <Dialog open={!!formId} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete form</DialogTitle>
          <DialogDescription>
            This will permanently delete <strong>{form?.title || "this form"}</strong> and all of its responses.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleteForm.isPending}>
            Delete permanently
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
