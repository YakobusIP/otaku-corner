import { useEffect } from "react";

import AllTimeStatisticsCards from "@/components/dashboard/AllTimeStatisticsCards";
import EntityConsumptionCard from "@/components/dashboard/EntityConsumptionCard";
import MediaConsumptionCard from "@/components/dashboard/MediaConsumptionCard";
import ProgressStatusCard from "@/components/dashboard/ProgressStatusCard";
import DashboardNavbar from "@/components/navbars/DashboardNavbar";
import { Separator } from "@/components/ui/separator";

export default function Dashboard() {
  useEffect(() => {
    document.title = "Dashboard | Otaku Corner Admin";
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <DashboardNavbar />
      <Separator />
      <main className="flex-1">
        <div className="flex flex-col gap-4 p-8">
          <h1>Welcome back, Admin!</h1>

          <section className="flex flex-col xl:flex-row items-center justify-center w-full gap-4">
            <MediaConsumptionCard />
            <EntityConsumptionCard />
          </section>
          <section className="flex flex-col xl:flex-row items-stretch justify-center w-full gap-4">
            <ProgressStatusCard />
            <AllTimeStatisticsCards />
          </section>
        </div>
      </main>
    </div>
  );
}
