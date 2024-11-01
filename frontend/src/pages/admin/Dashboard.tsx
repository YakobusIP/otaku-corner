import AllTimeStatisticsCards from "@/components/admin/dashboard/AllTimeStatisticsCards";
import EntityConsumptionCard from "@/components/admin/dashboard/EntityConsumptionCard";
import MediaConsumptionCard from "@/components/admin/dashboard/MediaConsumptionCard";
import ProgressStatusCard from "@/components/admin/dashboard/ProgressStatusCard";
import LogoutButton from "@/components/admin/LogoutButton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useWideScreen from "@/hooks/useWideScreen";
import { LayoutListIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const isWideScreen = useWideScreen();

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="flex flex-col xl:flex-row items-center bg-background border-b">
        <img src="/logo.png" className="w-32 mt-2 xl:mt-0 ml-0 xl:ml-2" />
        <div className="flex items-center justify-end w-full gap-2 p-3 xl:pl-2 xl:pr-4 xl:py-4">
          <div className="flex items-center w-full xl:w-fit gap-2">
            <Link to="/admin/media-list" className="w-full xl:w-fit">
              <Button className="w-full">
                <LayoutListIcon className="mr-2 w-4 h-4" /> Media List
              </Button>
            </Link>
            {!isWideScreen && <LogoutButton />}
          </div>
          {isWideScreen && <LogoutButton />}
        </div>
      </header>
      <Separator />
      <main className="flex-1">
        <div className="flex flex-col gap-4 p-8">
          <h1>Welcome back, Admin!</h1>

          <section className="flex flex-col xl:flex-row items-center justify-center w-full gap-4">
            <MediaConsumptionCard />
            <EntityConsumptionCard />
          </section>
          <section className="flex flex-col xl:flex-row items-center justify-center w-full gap-4">
            <ProgressStatusCard />
            <AllTimeStatisticsCards />
          </section>
        </div>
      </main>
    </div>
  );
}
