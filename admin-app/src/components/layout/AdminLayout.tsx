import { ReactNode } from "react";

import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

import {
  BarChart3Icon,
  BookOpenIcon,
  ExternalLinkIcon,
  MenuIcon
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
};

type NavItem = {
  to: string;
  label: string;
  icon: ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: <BarChart3Icon className="h-4 w-4" />
  },
  {
    to: "/media",
    label: "Media Library",
    icon: <BookOpenIcon className="h-4 w-4" />
  }
];

function SidebarNav() {
  const location = useLocation();

  return (
    <nav className="flex flex-col gap-2">
      {NAV_ITEMS.map((item) => {
        const active = location.pathname.startsWith(item.to);

        return (
          <Link key={item.to} to={item.to}>
            <Button
              variant={active ? "default" : "ghost"}
              className="w-full justify-start"
            >
              {item.icon}
              {item.label}
            </Button>
          </Link>
        );
      })}

      <Link to={import.meta.env.VITE_PUBLIC_APP} target="_blank">
        <Button variant="outline" className="w-full justify-start">
          <ExternalLinkIcon className="h-4 w-4" />
          Public App
        </Button>
      </Link>
    </nav>
  );
}

export default function AdminLayout({
  title,
  description,
  children,
  actions
}: Props) {
  return (
    <div className="h-screen overflow-hidden text-foreground">
      <div className="grid h-full w-full grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-screen flex-col border-r border-border/60 bg-card/70 backdrop-blur-xl xl:flex">
          <div className="flex h-full flex-col p-4">
            <img src="/logo.png" className="mb-4 w-36" />
            <ScrollArea className="min-h-0 flex-1 pr-2">
              <SidebarNav />
            </ScrollArea>
            <div className="mt-4">
              <LogoutButton fullWidth />
            </div>
          </div>
        </aside>

        <main className="min-h-0 overflow-y-auto">
          <header className="sticky top-0 z-40 border-b border-border/60 bg-card/60 backdrop-blur-xl">
            <div className="px-4 py-3 md:px-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="xl:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MenuIcon className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                      <SheetHeader>
                        <SheetTitle>Admin Menu</SheetTitle>
                        <SheetDescription>
                          Navigate between dashboard sections and account actions.
                        </SheetDescription>
                      </SheetHeader>
                      <ScrollArea className="h-full mt-4">
                        <SidebarNav />
                        <div className="mt-4">
                          <LogoutButton fullWidth />
                        </div>
                      </ScrollArea>
                    </SheetContent>
                  </Sheet>
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold">{title}</h1>
                  {description ? (
                    <p className="text-sm text-muted-foreground">{description}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-2">{actions}</div>
            </div>
          </header>

          <section className="p-4 md:p-6">{children}</section>
        </main>
      </div>
    </div>
  );
}
