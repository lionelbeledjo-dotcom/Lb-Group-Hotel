import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BedDouble, CalendarCheck, MessageSquare, TrendingUp } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — LB Group" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [rooms, reservations, requests] = await Promise.all([
        supabase.from("rooms").select("status", { count: "exact" }),
        supabase.from("reservations").select("status,total_amount,check_in"),
        supabase.from("guest_requests").select("status").eq("status", "new"),
      ]);
      const occupied = rooms.data?.filter((r: any) => r.status === "occupied").length ?? 0;
      const total = rooms.count ?? 0;
      const today = new Date().toISOString().slice(0, 10);
      const revenueToday = (reservations.data ?? [])
        .filter((r: any) => r.check_in === today)
        .reduce((s: number, r: any) => s + Number(r.total_amount || 0), 0);
      return {
        totalRooms: total,
        occupancy: total ? Math.round((occupied / total) * 100) : 0,
        pendingRequests: requests.data?.length ?? 0,
        revenueToday,
      };
    },
  });

  const chartData = [
    { d: "Lun", v: 62 }, { d: "Mar", v: 70 }, { d: "Mer", v: 68 },
    { d: "Jeu", v: 80 }, { d: "Ven", v: 88 }, { d: "Sam", v: 92 }, { d: "Dim", v: 85 },
  ];

  const cards = [
    { label: "Chambres", value: stats?.totalRooms ?? 0, icon: BedDouble },
    { label: "Taux d'occupation", value: `${stats?.occupancy ?? 0}%`, icon: TrendingUp },
    { label: "Demandes en attente", value: stats?.pendingRequests ?? 0, icon: MessageSquare },
    { label: "Revenus du jour", value: `€ ${(stats?.revenueToday ?? 0).toLocaleString()}`, icon: CalendarCheck },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Dashboard</h1>
        <p className="text-sm text-muted-foreground">Vue d'ensemble de votre établissement</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="glass">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.label}</CardTitle>
              <c.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold gradient-text">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="glass lg:col-span-2">
          <CardHeader><CardTitle>Tendance d'occupation</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 250)" />
                <XAxis dataKey="d" stroke="oklch(0.5 0.02 250)" />
                <YAxis stroke="oklch(0.5 0.02 250)" />
                <Tooltip contentStyle={{ background: "oklch(0.99 0.005 250)", border: "1px solid oklch(0.9 0.01 250)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="v" stroke="oklch(0.35 0.12 250)" strokeWidth={3} dot={{ fill: "oklch(0.35 0.12 250)" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader><CardTitle>Activité récente</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {["Check-in chambre 204", "Ménage terminé 312", "Demande taxi 105", "Maintenance climatisation 401", "Nouvelle réservation #1238"].map((t) => (
              <div key={t} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full gradient-bg" />{t}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}