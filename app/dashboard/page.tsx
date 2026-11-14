import { DashboardClient } from "@/components/dashboard-client";
import { investigations } from "@/lib/data";

export default function DashboardPage() {
  return <DashboardClient items={investigations} />;
}
