import { ImpactDashboard } from "@/components/dashboard/impact-dashboard";
import { getDataset } from "@/lib/data/load";

export default function Home() {
  return <ImpactDashboard dataset={getDataset()} />;
}
