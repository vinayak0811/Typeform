import { BuilderPage } from "@/features/builder/builder-page";

export default async function Page({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  return <BuilderPage formId={formId} />;
}
