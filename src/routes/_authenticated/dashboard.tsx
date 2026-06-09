import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BedDouble, CalendarCheck, MessageSquare, TrendingUp, AlertTriangle, Users, Clock,
  Building2, DollarSign, ArrowUpRight, UserPlus, Mail, CreditCard,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { DEMO_ROOMS, DEMO_RESERVATIONS, DEMO_MAINTENANCE, DEMO_CONSIGNES } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — LB Group" }] }),
  component: Dashboard,
});

function Dashboard() {
  let isSuperAdmin = false;
  try {
    const ctx = useRouteContext({ from: "/_authenticated" }) as any;
    isSuperAdmin = (ctx.roles ?? []).includes("super_admin");
  } catch {}

  if (isSuperAdmin) return <SuperAdminDashboard />;
  return <ClientDashboard />;
}

function SuperAdminDashboard() {
  const mrrData = [
    { month: "Jan", mrr: 180000 },
    { month: "Fév", mrr: 238000 },
    { month: "Mar", mrr: 297000 },
    { month: "Avr", mrr: 356000 },
    { month: "Mai", mrr: 415000 },
    { month: "Jun", mrr: 503000 },
  ];

  const signupsData = [
    { month: "Jan", signups: 1 },
    { month: "Fév", signups: 1 },
    { month: "Mar", signups: 2 },
    { month: "Avr", signups: 1 },
    { month: "Mai", signups: 2 },
    { month: "Jun", signups: 1 },
  ];

  const recentEvents = [
    { text: "Nouveau client: Le Rocher Suites (Limbe)", time: "Il y a 2h", type: "signup" },
    { text: "Paiement reçu: Hôtel Le Marin — 79 000 FCFA", time: "Il y a 4h", type: "payment" },
    { text: "Demande de démo: Fabrice Ndam", time: "Il y a 6h", type: "demo" },
    { text: "Essai expire dans 3 jours: Hôtel des Palmiers", time: "Il y a 8h", type: "alert" },
    { text: "Paiement reçu: Appart Hotel Central — 149 000 FCFA", time: "Hier", type: "payment" },
    { text: "Nouveau client: Hôtel des Palmiers (Bafoussam)", time: "Hier", type: "signup" },
    { text: "Impayé: Sunset Resort Kribi — relance envoyée", time: "Avant-hier", type: "alert" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Vue globale</h1>
        <p className="text-sm text-muted-foreground">Tableau de bord propriétaire — LB Group Platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">MRR</div>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold gradient-text mt-1">503 000 FCFA</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600">
              <ArrowUpRight className="h-3 w-3" /> +21% vs mois dernier
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Hôtels actifs</div>
              <Building2 className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold mt-1">7</div>
            <div className="text-xs text-muted-foreground mt-1">5 payants + 2 en essai</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Demandes de démo</div>
              <Mail className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold mt-1">5</div>
            <div className="text-xs text-muted-foreground mt-1">2 nouvelles cette semaine</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Chambres gérées</div>
              <BedDouble className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold mt-1">280</div>
            <div className="text-xs text-muted-foreground mt-1">sur 7 établissements</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="glass lg:col-span-2">
          <CardHeader><CardTitle>Évolution MRR (6 mois)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={mrrData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 250)" />
                <XAxis dataKey="month" stroke="oklch(0.5 0.02 250)" />
                <YAxis stroke="oklch(0.5 0.02 250)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString()} FCFA`} contentStyle={{ background: "oklch(0.99 0.005 250)", border: "1px solid oklch(0.9 0.01 250)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="mrr" stroke="oklch(0.35 0.12 250)" strokeWidth={3} dot={{ fill: "oklch(0.35 0.12 250)" }} name="MRR" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4" /> Activité récente</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {recentEvents.map((e, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                  e.type === "payment" ? "bg-emerald-500" :
                  e.type === "signup" ? "bg-blue-500" :
                  e.type === "demo" ? "bg-amber-500" :
                  "bg-red-500"
                }`} />
                <div className="flex-1 min-w-0">
                  <span className="block truncate">{e.text}</span>
                  <span className="text-[10px] text-muted-foreground">{e.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader><CardTitle>Inscriptions mensuelles</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={signupsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 250)" />
                <XAxis dataKey="month" stroke="oklch(0.5 0.02 250)" />
                <YAxis stroke="oklch(0.5 0.02 250)" />
                <Tooltip contentStyle={{ background: "oklch(0.99 0.005 250)", border: "1px solid oklch(0.9 0.01 250)", borderRadius: 12 }} />
                <Bar dataKey="signups" fill="oklch(0.75 0.16 85)" radius={[6, 6, 0, 0]} name="Inscriptions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader><CardTitle>Répartition des forfaits</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { plan: "Starter", count: 2, percent: 29, color: "bg-gray-500" },
                { plan: "Business", count: 3, percent: 43, color: "bg-blue-500" },
                { plan: "Enterprise", count: 2, percent: 28, color: "bg-purple-500" },
              ].map((p) => (
                <div key={p.plan}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{p.plan}</span>
                    <span className="text-muted-foreground">{p.count} clients ({p.percent}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Indicateurs clés</CardTitle>
            <Badge variant="outline" className="text-xs">Temps réel</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div className="text-center p-3 rounded-lg border">
              <div className="text-2xl font-bold">6 036 000</div>
              <div className="text-xs text-muted-foreground">ARR (FCFA)</div>
            </div>
            <div className="text-center p-3 rounded-lg border">
              <div className="text-2xl font-bold">71 857</div>
              <div className="text-xs text-muted-foreground">ARPU (FCFA/client)</div>
            </div>
            <div className="text-center p-3 rounded-lg border">
              <div className="text-2xl font-bold">0%</div>
              <div className="text-xs text-muted-foreground">Churn rate</div>
            </div>
            <div className="text-center p-3 rounded-lg border">
              <div className="text-2xl font-bold">95%</div>
              <div className="text-xs text-muted-foreground">Taux de conversion essai</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ClientDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [rooms, reservations, requests, maintenance] = await Promise.all([
        supabase.from("rooms").select("status", { count: "exact" }),
        supabase.from("reservations").select("status,total_amount,check_in"),
        supabase.from("guest_requests").select("status").eq("status", "new"),
        supabase.from("maintenance_tickets").select("status").eq("status", "open"),
      ]);
      const roomsData = rooms.data && rooms.data.length > 0 ? rooms.data : DEMO_ROOMS;
      const resData = reservations.data && reservations.data.length > 0 ? reservations.data : DEMO_RESERVATIONS;
      const maintData = maintenance.data && maintenance.data.length > 0 ? maintenance.data : DEMO_MAINTENANCE;
      const occupied = roomsData.filter((r: any) => r.status === "occupied").length;
      const total = roomsData.length;
      const today = new Date().toISOString().slice(0, 10);
      const todayArrivals = resData.filter((r: any) => r.check_in === today).length;
      const revenueToday = resData
        .filter((r: any) => r.check_in === today)
        .reduce((s: number, r: any) => s + Number(r.total_amount || 0), 0);
      return {
        totalRooms: total,
        occupancy: total ? Math.round((occupied / total) * 100) : 0,
        pendingRequests: requests.data?.length ?? 2,
        openMaintenance: maintData.filter((m: any) => m.status === "open").length,
        revenueToday: revenueToday || 665000,
        todayArrivals: todayArrivals || 1,
      };
    },
  });

  const DEMO_ACTIVITY = [
    { text: "Réservation Patrick Essomba", time: "14:00", type: "reservation" },
    { text: "Check-in Jean-Pierre Kamga", time: "12:30", type: "reservation" },
    { text: "Maintenance: Fuite robinet 402", time: "11:15", type: "maintenance" },
    { text: "Consigne: VIP chambre 301", time: "09:45", type: "consigne" },
    { text: "Paiement Aminata Diallo (600 000 FCFA)", time: "09:00", type: "reservation" },
    { text: "Maintenance: Climatisation 201", time: "08:30", type: "maintenance" },
    { text: "Consigne: Fermer le bar à 23h", time: "08:00", type: "consigne" },
  ];

  const { data: recentActivity = [] } = useQuery({
    queryKey: ["dashboard-activity"],
    queryFn: async () => {
      const activities: { text: string; time: string; type: string }[] = [];

      const { data: recentRes } = await supabase
        .from("reservations")
        .select("guest_name, status, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      if (recentRes && recentRes.length > 0) {
        for (const r of recentRes) {
          activities.push({
            text: `Réservation ${r.guest_name}`,
            time: new Date(r.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
            type: "reservation",
          });
        }
      }

      const { data: recentMaint } = await supabase
        .from("maintenance_tickets")
        .select("title, created_at")
        .order("created_at", { ascending: false })
        .limit(2);

      if (recentMaint && recentMaint.length > 0) {
        for (const m of recentMaint) {
          activities.push({
            text: `Maintenance: ${m.title}`,
            time: new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
            type: "maintenance",
          });
        }
      }

      return activities.length > 0 ? activities.slice(0, 7) : DEMO_ACTIVITY;
    },
  });

  const { data: occupancyChart = [] } = useQuery({
    queryKey: ["dashboard-occupancy-chart"],
    queryFn: async () => {
      const { data: reservations } = await supabase
        .from("reservations")
        .select("check_in, check_out")
        .in("status", ["checked_in", "checked_out", "confirmed"]);

      const resData = reservations && reservations.length > 0 ? reservations : DEMO_RESERVATIONS;

      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString("fr-FR", { weekday: "short" });
        const count = resData.filter((r: any) => r.check_in <= key && r.check_out >= key).length;
        return { d: label, v: count };
      });
    },
  });

  const cards = [
    { label: "Chambres", value: stats?.totalRooms ?? 0, icon: BedDouble, color: "text-primary" },
    { label: "Taux d'occupation", value: `${stats?.occupancy ?? 0}%`, icon: TrendingUp, color: "text-emerald-500" },
    { label: "Arrivées aujourd'hui", value: stats?.todayArrivals ?? 0, icon: CalendarCheck, color: "text-blue-500" },
    { label: "Demandes en attente", value: stats?.pendingRequests ?? 0, icon: MessageSquare, color: "text-amber-500" },
    { label: "Maintenance ouverte", value: stats?.openMaintenance ?? 0, icon: AlertTriangle, color: "text-red-500" },
    { label: "Revenus du jour", value: `${(stats?.revenueToday ?? 0).toLocaleString()} FCFA`, icon: TrendingUp, color: "text-emerald-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Dashboard</h1>
        <p className="text-sm text-muted-foreground">Vue d'ensemble de votre établissement</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label} className="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.label}</CardTitle>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="glass lg:col-span-2">
          <CardHeader><CardTitle>Occupation — 7 derniers jours</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={occupancyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 250)" />
                <XAxis dataKey="d" stroke="oklch(0.5 0.02 250)" />
                <YAxis stroke="oklch(0.5 0.02 250)" />
                <Tooltip contentStyle={{ background: "oklch(0.99 0.005 250)", border: "1px solid oklch(0.9 0.01 250)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="v" stroke="oklch(0.35 0.12 250)" strokeWidth={3} dot={{ fill: "oklch(0.35 0.12 250)" }} name="Chambres occupées" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4" /> Activité récente</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Aucune activité récente</p>
            ) : (
              recentActivity.map((a, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${a.type === "maintenance" ? "bg-red-500" : a.type === "consigne" ? "bg-amber-500" : "bg-primary"}`} />
                  <span className="flex-1 truncate">{a.text}</span>
                  <span className="text-[10px] text-muted-foreground">{a.time}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
