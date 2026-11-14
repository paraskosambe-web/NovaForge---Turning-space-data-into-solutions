import { notFound } from "next/navigation";
import { DetailView } from "@/components/detail-view";
import { findInvestigation, investigations } from "@/lib/data";

export function generateStaticParams() {
  return investigations.map((item) => ({ id: item.id }));
}

export default async function InvestigationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = findInvestigation(id);
  if (!item) notFound();
  return <DetailView item={item} all={investigations} />;
}
