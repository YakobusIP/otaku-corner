import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTrigger
} from "@/components/ui/sheet";

import useWideScreen from "@/hooks/useWideScreen";

import { GlobeIcon, LayoutListIcon, MenuIcon } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardNavbar() {
  const isWideScreen = useWideScreen();

  return isWideScreen ? (
    <header className="flex items-center bg-background border-b">
      <img src="/logo.png" className="w-32 mt-0 ml-2" />
      <div className="flex items-center justify-end w-full gap-2 p-3 xl:pl-2 xl:pr-4 xl:py-4">
        <div className="flex items-center w-full xl:w-fit gap-2">
          <Link
            to={import.meta.env.VITE_PUBLIC_APP}
            className="w-full xl:w-fit"
            target="_blank"
          >
            <Button className="w-full">
              <GlobeIcon className="w-4 h-4" /> Public App
            </Button>
          </Link>
          <Link to="/media-list" className="w-full xl:w-fit">
            <Button className="w-full">
              <LayoutListIcon className="w-4 h-4" /> Media List
            </Button>
          </Link>
        </div>
        <LogoutButton />
      </div>
    </header>
  ) : (
    <header className="flex items-center justify-between bg-background border-b p-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <MenuIcon className="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <ScrollArea className="h-full">
            <SheetHeader className="items-center">
              <img src="/logo.png" className="w-32 my-2" />
            </SheetHeader>
            <div className="flex flex-col gap-2 my-2">
              <Link
                to={import.meta.env.VITE_PUBLIC_APP}
                className="w-full xl:w-fit"
                target="_blank"
              >
                <Button className="w-full" variant="outline">
                  <GlobeIcon className="w-4 h-4" /> Public App
                </Button>
              </Link>
              <Link to="/media-list" className="w-full xl:w-fit">
                <Button className="w-full" variant="outline">
                  <LayoutListIcon className="w-4 h-4" /> Media List
                </Button>
              </Link>
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <LogoutButton fullWidth />
              </SheetClose>
            </SheetFooter>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </header>
  );
}
