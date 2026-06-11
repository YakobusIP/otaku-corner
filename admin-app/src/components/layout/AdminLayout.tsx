import { type CSSProperties, type ReactNode, type Ref, useEffect } from "react";

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

import {
  BarChart3Icon,
  BookOpenIcon,
  ExternalLinkIcon,
  PanelLeftIcon
} from "lucide-react";
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
  scrollContainerRef?: Ref<HTMLDivElement>;
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
    to: "/media-list",
    label: "Media Library",
    icon: <BookOpenIcon />
  }
];

function AppSidebar() {
  const location = useLocation();
  const { isMobile, state, toggleSidebar } = useSidebar();
  const showExpandedBrand = isMobile || state === "expanded";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/60 **:data-[sidebar=sidebar]:border-border/60 **:data-[sidebar=sidebar]:bg-card/85 **:data-[sidebar=sidebar]:text-foreground **:data-[sidebar=sidebar]:backdrop-blur-xl"
    >
      <SidebarHeader className="border-b border-border/50 px-2 py-3">
        {showExpandedBrand ? (
          <div className="flex min-w-0 items-center justify-between gap-2">
            <Link
              to="/dashboard"
              className="flex min-w-0 flex-1 items-center gap-2 rounded-md outline-hidden ring-sidebar-ring focus-visible:ring-2"
              aria-label="Otaku Corner Admin — Dashboard home"
            >
              <img
                src="/otaku-corner-logo.webp"
                alt=""
                className="h-14 w-auto max-w-[min(100%,280px)] shrink-0 object-contain object-left transition-[max-width,height,width] duration-200 ease-linear tablet:group-data-[state=expanded]:h-16 tablet:group-data-[state=expanded]:w-auto tablet:group-data-[state=expanded]:max-w-[min(calc(var(--sidebar-width)-1rem),288px)] tablet:group-data-[state=expanded]:object-left desktop:group-data-[state=expanded]:h-16 desktop:group-data-[state=expanded]:w-auto desktop:group-data-[state=expanded]:max-w-[min(calc(var(--sidebar-width)-1rem),288px)] desktop:group-data-[state=expanded]:object-left"
              />
              <span className="truncate text-sm font-semibold tracking-tight text-foreground">
                Otaku Corner
                <br />
                Admin
              </span>
            </Link>
            <SidebarTrigger className="shrink-0" />
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              className="group/collapsed-brand relative flex h-7 w-7 shrink-0 items-center justify-center rounded-md outline-hidden ring-offset-background transition hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <img
                src="/otaku-corner-logo.webp"
                alt=""
                className="absolute inset-0 m-auto h-7 w-7 object-contain opacity-100 transition-opacity duration-150 group-hover/collapsed-brand:pointer-events-none group-hover/collapsed-brand:opacity-0"
              />
              <PanelLeftIcon className="relative z-10 h-4 w-4 shrink-0 text-sidebar-foreground opacity-0 transition-opacity duration-150 group-hover/collapsed-brand:opacity-100" />
            </button>
          </div>
        )}
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
  hideHeader = false,
  scrollContainerRef
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
      <SidebarInset className="min-h-0 min-w-0 overflow-hidden bg-transparent">
        <div
          ref={scrollContainerRef}
          className="@container min-h-0 w-full min-w-0 flex-1 overflow-y-auto"
        >
          <section className="flex flex-col gap-4 p-4 xl:p-6">
            {hideHeader ? null : (
              <header className="flex shrink-0 items-center gap-3 bg-transparent">
                <SidebarTrigger className="@tablet:hidden" />
                <div className="min-w-0 flex-1">
                  <h1 className="inline-block max-w-full bg-linear-to-r from-[#4F8CFF] via-[#7C6CF6] to-[#A855F7] bg-clip-text text-xl font-bold text-transparent xl:text-3xl">
                    {title}
                  </h1>
                  {description ? (
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {actions}
                </div>
              </header>
            )}
            {children}
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
