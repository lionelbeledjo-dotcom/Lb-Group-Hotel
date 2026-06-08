import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";
import {
  SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger,
  SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, CalendarDays, BedDouble, Brush, Wrench, MessageSquare,
  Headset, Users, Receipt, BarChart3, Settings, LogOut, Bell, Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

const groups: { label: string; items: { to: string; label: string; icon: any }[] }[] = [
  { label: "Vue d'ensemble", items: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ]},
  { label: "Opérations", items: [
    { to: "/reservations", label: "Réservations", icon: CalendarDays },
    { to: "/rooms", label: "Chambres", icon: BedDouble },
    { to: "/housekeeping", label: "Housekeeping", icon: Brush },
    { to: "/maintenance", label: "Maintenance", icon: Wrench },
    { to: "/requests", label: "Conciergerie", icon: MessageSquare },
  ]},
  { label: "Réception", items: [
    { to: "/reception", label: "Check-in / out", icon: Headset },
  ]},
  { label: "Management", items: [
    { to: "/finance", label: "Finance", icon: Receipt },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/communication", label: "Communication", icon: Users },
    { to: "/settings", label: "Paramètres", icon: Settings },
  ]},
];

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <Link to="/dashboard" className="flex items-center gap-2 px-2 py-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg gold-bg font-bold text-sm text-[oklch(0.15_0.03_250)]">LB</div>
              <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden">LB <span className="gold-text">Group</span></span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            {groups.map((g) => (
              <SidebarGroup key={g.label}>
                <SidebarGroupLabel>{g.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {g.items.map((it) => (
                      <SidebarMenuItem key={it.to}>
                        <SidebarMenuButton asChild isActive={pathname === it.to}>
                          <Link to={it.to}>
                            <it.icon />
                            <span>{it.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut}>
                  <LogOut /><span>Déconnexion</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur">
            <SidebarTrigger />
            <div className="relative ml-2 hidden flex-1 max-w-md md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher (réservations, chambres, invités...)" className="pl-9" />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon"><Bell className="h-4 w-4" /></Button>
              <div className="h-8 w-8 rounded-full gradient-bg" />
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}