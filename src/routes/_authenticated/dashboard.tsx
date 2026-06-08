import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BedDouble, CalendarCheck, MessageSquare, TrendingUp, AlertTriangle, Users, Clock } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — LB Group" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [rooms, reservations, requests, maintenance] = await Promise.all([
        supabase.from("rooms").select("status", { count: "exact" }),
        supabase.from("reservations").select("status,total_amount,check_in"),
        supabase.from("guest_requests").select("status").eq("status", "new"),
        supabase.from("maintenance_tickets").select("status").eq("status", "open"),
      ]);
      const occupied = rooms.data?.filter((r: any) => r.status === "occupied").length ?? 0;
      const total = rooms.count ?? 0;
      const today = new Date().toISOString().slice(0, 10);
      const todayArrivals = (reservations.data ?? []).filter((r: any) => r.check_in === today).length;
      const revenueToday = (reservations.data ?? [])
        .filter((r: any) => r.check_in === today)
        .reduce((s: number, r: any) => s + Number(r.total_amount || 0), 0);
      return {
        totalRooms: total,
        occupancy: total ? Math.round((occupied / total) * 100) : 0,
        pendingRequests: requests.data?.length ?? 0,
        openMaintenance: maintenance.data?.length ?? 0,
        revenueToday,
        todayArrivals,
      };
    },
  });

  const { data: recentActivity = [] } = useQuery({
    queryKey: ["dashboard-activity"],
    queryFn: async () => {
      const activities: { text: string; time: string; type: string }[] = [];

      const { data: recentRes } = await supabase
        .from("reservations")
        .select("guest_name, status, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      if (recentRes) {
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

      if (recentMaint) {
        for (const m of recentMaint) {
          activities.push({
            text: `Maintenance: ${m.title}`,
            time: new Date(m.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
            type: "maintenance",
          });
        }
      }

      const { data: recentConsignes } = await supabase
        .from("consignes" as any)
        .select("title, created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(2);

      if (recentConsignes) {
        for (const c of recentConsignes as any[]) {
          activities.push({
            text: `Consigne: ${c.title}`,
            time: new Date(c.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
            type: "consigne",
          });
        }
      }

      return activities.slice(0, 7);
    },
  });

  const { data: occupancyChart = [] } = useQuery({
    queryKey: ["dashboard-occupancy-chart"],
    queryFn: async () => {
      const { data: reservations } = await supabase
        .from("reservations")
        .select("check_in, check_out")
        .in("status", ["checked_in", "checked_out", "confirmed"]);

      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString("fr-FR", { weekday: "short" });
        const count = (reservations ?? []).filter((r: any) => r.check_in <= key && r.check_out >= key).length;
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
