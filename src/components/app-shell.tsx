import { Link, useNavigate, useRouterState, useRouteContext } from "@tanstack/react-router";
import { type ReactNode, useMemo, useState } from "react";
import {
  SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger,
  SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, CalendarDays, BedDouble, Brush, Wrench, MessageSquare,
  Headset, Users, Receipt, BarChart3, Settings, LogOut, Bell, Search, Inbox, CreditCard,
  Calendar, ScrollText, Wallet, Package, SearchCheck, ClipboardCheck, FileText, User,
  Building2, UserCheck, Mail, Shield, TrendingUp,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";
import { NotificationsPanel } from "@/components/notifications-panel";
import { EstablishmentSwitcher } from "@/components/establishment-switcher";

type NavItem = { to: string; label: string; icon: any; roles?: string[] };
type NavGroup = { label: string; items: NavItem[] };

const superAdminGroups: NavGroup[] = [
  { label: "Plateforme", items: [
    { to: "/dashboard", label: "Vue globale", icon: LayoutDashboard, roles: ["super_admin"] },
    { to: "/admin/clients", label: "Hôtels clients", icon: Building2, roles: ["super_admin"] },
    { to: "/admin/demos", label: "Demandes de démo", icon: Mail, roles: ["super_admin"] },
    { to: "/admin/users", label: "Utilisateurs", icon: UserCheck, roles: ["super_admin"] },
  ]},
  { label: "Business", items: [
    { to: "/subscriptions", label: "Abonnements", icon: CreditCard, roles: ["super_admin"] },
    { to: "/admin/revenue", label: "Revenus & MRR", icon: TrendingUp, roles: ["super_admin"] },
    { to: "/finance", label: "Factures", icon: Receipt, roles: ["super_admin"] },
    { to: "/analytics", label: "Analytics", icon: BarChart3, roles: ["super_admin"] },
  ]},
  { label: "Support", items: [
    { to: "/inbox", label: "Messages contacts", icon: Inbox, roles: ["super_admin"] },
    { to: "/communication", label: "Annonces", icon: Bell, roles: ["super_admin"] },
  ]},
  { label: "Configuration", items: [
    { to: "/settings", label: "Paramètres", icon: Settings, roles: ["super_admin"] },
  ]},
];

const clientGroups: NavGroup[] = [
  { label: "Vue d'ensemble", items: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/agenda", label: "Agenda", icon: Calendar },
    { to: "/communication", label: "Annonces", icon: Bell },
  ]},
  { label: "Opérations", items: [
    { to: "/consignes", label: "Consignes", icon: ScrollText },
    { to: "/reservations", label: "Réservations", icon: CalendarDays, roles: ["admin", "receptionist"] },
    { to: "/rooms", label: "État des chambres", icon: BedDouble, roles: ["admin", "receptionist"] },
    { to: "/housekeeping", label: "Checklists", icon: Brush, roles: ["admin", "housekeeper"] },
    { to: "/cash-register", label: "Fonds de caisse", icon: Wallet, roles: ["admin", "receptionist"] },
    { to: "/lost-found", label: "Objets trouvés", icon: SearchCheck, roles: ["admin", "receptionist", "housekeeper"] },
    { to: "/lent-items", label: "Objets prêtés", icon: Package, roles: ["admin", "receptionist"] },
    { to: "/maintenance", label: "Problèmes techniques", icon: Wrench, roles: ["admin", "maintenance"] },
    { to: "/requests", label: "Conciergerie", icon: MessageSquare, roles: ["admin", "receptionist"] },
  ]},
  { label: "Réception", items: [
    { to: "/reception", label: "Check-in / out", icon: Headset, roles: ["admin", "receptionist"] },
  ]},
  { label: "Management", items: [
    { to: "/quality", label: "Contrôles qualités", icon: ClipboardCheck, roles: ["admin"] },
    { to: "/contracts", label: "Mes contrats", icon: FileText, roles: ["admin"] },
    { to: "/finance", label: "Mes factures", icon: Receipt, roles: ["admin"] },
    { to: "/analytics", label: "Mes chiffres", icon: BarChart3, roles: ["admin"] },
    { to: "/subscriptions", label: "Abonnement", icon: CreditCard, roles: ["admin"] },
    { to: "/inbox", label: "Boîte de réception", icon: Inbox, roles: ["admin"] },
    { to: "/settings", label: "Paramètres", icon: Settings, roles: ["admin"] },
  ]},
];

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [searchQuery, setSearchQuery] = useState("");

  let userRoles: string[] = [];
  let userName = "";
  let userEmail = "";
  try {
    const ctx = useRouteContext({ from: "/_authenticated" }) as any;
    userRoles = ctx.roles ?? [];
    userName = ctx.user?.user_metadata?.full_name || "";
    userEmail = ctx.user?.email || "";
  } catch {
    // context not available yet
  }

  const isSuperAdmin = userRoles.includes("super_admin");

  const filteredGroups = useMemo(() => {
    const baseGroups = isSuperAdmin ? superAdminGroups : clientGroups;
    if (userRoles.length === 0) return clientGroups;
    return baseGroups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => {
          if (!item.roles) return true;
          return item.roles.some((r) => userRoles.includes(r));
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [userRoles, isSuperAdmin]);

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login", replace: true });
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
            {filteredGroups.map((g) => (
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
            <div className="flex items-center gap-2 px-2 py-2 group-data-[collapsible=icon]:justify-center">
              <div className="grid h-8 w-8 place-items-center rounded-full gradient-bg text-xs font-bold text-white shrink-0">
                {userName ? userName.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="text-xs font-medium truncate">{userName || "Utilisateur"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
              </div>
            </div>
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
            <form
              className="relative ml-2 hidden flex-1 max-w-md md:block"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  navigate({ to: "/reservations", search: { q: searchQuery.trim() } as any });
                  setSearchQuery("");
                }
              }}
            >
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher (réservations, chambres, invités...)"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <div className="ml-auto flex items-center gap-3">
              <EstablishmentSwitcher />
              <NotificationsPanel />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full focus:outline-none">
                    <div className="grid h-8 w-8 place-items-center rounded-full gradient-bg text-xs font-bold text-white">
                      {userName ? userName.charAt(0).toUpperCase() : userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{userName || "Utilisateur"}</p>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
                    <Settings className="mr-2 h-4 w-4" /> Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
