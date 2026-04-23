import { useEffect } from "react";

import AllTimeStatisticsCards from "@/components/dashboard/AllTimeStatisticsCards";
import EntityConsumptionCard from "@/components/dashboard/EntityConsumptionCard";
import MediaConsumptionCard from "@/components/dashboard/MediaConsumptionCard";
import ProgressStatusCard from "@/components/dashboard/ProgressStatusCard";
import AdminLayout from "@/components/layout/AdminLayout";

export default function Dashboard() {
  useEffect(() => {
    document.title = "Dashboard | Otaku Corner Admin";
  }, []);

  return (
    <AdminLayout
      title="Dashboard"
      description="Systematic overview of your anime, manga, and light novel admin data."
    >
      <div className="flex flex-col gap-4">
        <section className="flex flex-col xl:flex-row items-center justify-center w-full gap-4">
          <MediaConsumptionCard />
          <EntityConsumptionCard />
        </section>
        <section className="flex flex-col xl:flex-row items-stretch justify-center w-full gap-4">
          <ProgressStatusCard />
          <AllTimeStatisticsCards />
        </section>
      </div>
    </AdminLayout>
  );
}
