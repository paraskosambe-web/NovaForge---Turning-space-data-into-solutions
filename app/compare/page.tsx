import { CompareClient } from "@/components/compare-client";
import { investigations } from "@/lib/data";

export default function ComparePage() {
  return <CompareClient items={investigations} />;
}
