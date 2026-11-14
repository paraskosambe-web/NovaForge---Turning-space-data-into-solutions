import { ExplorerClient } from "@/components/explorer-client";
import { investigations } from "@/lib/data";

export default function InvestigationsPage() {
  return <ExplorerClient items={investigations} />;
}
