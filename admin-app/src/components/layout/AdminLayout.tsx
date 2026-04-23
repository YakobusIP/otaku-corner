import { useEffect, type CSSProperties, type ReactNode } from "react";

import LogoutButton from "@/components/LogoutButton";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar";

import { BarChart3Icon, BookOpenIcon, ExternalLinkIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

function MobileSidebarCloseOnNavigate() {
  const pathname = useLocation().pathname;
  const { isMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    if (isMobile) setOpenMobile(false);
  }, [pathname, isMobile, setOpenMobile]);

  return null;
}

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  hideHeader?: boolean;
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
    icon: <BarChart3Icon />
  },
  {
    to: "/media",
    label: "Media Library",
    icon: <BookOpenIcon />
  }
];

function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/60 [&_[data-sidebar=sidebar]]:border-border/60 [&_[data-sidebar=sidebar]]:bg-card/85 [&_[data-sidebar=sidebar]]:text-foreground [&_[data-sidebar=sidebar]]:backdrop-blur-xl"
    >
      <SidebarHeader className="border-b border-border/50 px-2 py-3">
        <Link
          to="/dashboard"
          className="flex min-w-0 items-center gap-2 rounded-md outline-none ring-sidebar-ring focus-visible:ring-2"
          aria-label="Otaku Corner Admin — Dashboard home"
        >
          <img
            src="/otaku-corner-logo.webp"
            alt=""
            className="h-14 w-auto max-w-[min(100%,280px)] shrink-0 object-contain object-left transition-[max-width,height,width] duration-200 ease-linear md:group-data-[state=collapsed]:h-7 md:group-data-[state=collapsed]:w-7 md:group-data-[state=collapsed]:max-w-7 md:group-data-[state=collapsed]:object-center md:group-data-[state=expanded]:h-16 md:group-data-[state=expanded]:w-auto md:group-data-[state=expanded]:max-w-[min(calc(var(--sidebar-width)-1rem),288px)] md:group-data-[state=expanded]:object-left"
          />
          <span className="truncate text-sm font-semibold tracking-tight text-foreground md:group-data-[state=collapsed]:hidden">
            Admin
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const active = location.pathname.startsWith(item.to);

                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                    >
                      <Link to={item.to}>
                        {item.icon}
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  variant="outline"
                  tooltip="Public App"
                >
                  <a
                    href={import.meta.env.VITE_PUBLIC_APP}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLinkIcon />
                    <span>Public App</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-border/50">
        <LogoutButton
          fullWidth
          className="group-data-[collapsible=icon]:justify-center"
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export default function AdminLayout({
  title,
  description,
  children,
  actions,
  hideHeader = false
}: Props) {
  return (
    <SidebarProvider
      className="h-screen overflow-hidden text-foreground"
      style={
        {
          "--sidebar-width": "17.5rem"
        } as CSSProperties
      }
    >
      <MobileSidebarCloseOnNavigate />
      <AppSidebar />
      <SidebarInset className="min-h-0 overflow-hidden bg-transparent">
        {hideHeader ? null : (
          <header className="sticky top-0 z-40 flex shrink-0 items-center gap-3 border-b border-border/60 bg-card/60 px-4 py-3 backdrop-blur-xl md:px-6">
            <SidebarTrigger />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold md:text-2xl">{title}</h1>
              {description ? (
                <p className="text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          </header>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <section className="p-4 md:p-6">{children}</section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
