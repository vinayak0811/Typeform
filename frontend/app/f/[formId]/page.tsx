import { PublicFormRuntime } from "@/features/public-form/public-form-runtime";

export default async function PublicFormPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  return <PublicFormRuntime formId={formId} />;
}
