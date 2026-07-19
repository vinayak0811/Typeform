import { ResponsesPage } from "@/features/responses/responses-page";

export default async function Page({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = await params;
  return <ResponsesPage formId={formId} />;
}
