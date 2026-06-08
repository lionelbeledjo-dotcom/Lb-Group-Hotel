import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, BedDouble, TrendingUp, Clock, Users } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — LB Group" }] }),
  component: AnalyticsPage,
});

const COLORS = ["oklch(0.68 0.27 350)", "oklch(0.6 0.2 280)", "oklch(0.7 0.15 200)", "oklch(0.65 0.2 140)"];

function AnalyticsPage() {
  const { data: rooms = [] } = useQuery({
    queryKey: ["analytics-rooms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("status, category, price_per_night");
      if (error) throw error;
      return data;
    },
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ["analytics-reservations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reservations").select("status, total_amount, check_in, check_out, rooms(category)");
      if (error) throw error;
      return data;
    },
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["analytics-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("amount, status, paid_at");
      if (error) throw error;
      return data;
    },
  });

  const totalRooms = rooms.length;
  const occupied = rooms.filter((r: any) => r.status === "occupied").length;
  const occupancyRate = totalRooms ? Math.round((occupied / totalRooms) * 100) : 0;

  const totalRevenue = invoices.filter((i: any) => i.status === "paid").reduce((s: number, i: any) => s + Number(i.amount), 0);
  const totalReservations = reservations.length;

  const avgStay = reservations.length > 0
    ? (reservations.reduce((s: number, r: any) => {
        const days = (new Date(r.check_out).getTime() - new Date(r.check_in).getTime()) / 86400000;
        return s + Math.max(days, 1);
      }, 0) / reservations.length).toFixed(1)
    : "0";

  const categoryData = ["standard", "deluxe", "suite", "apartment"].map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    rooms: rooms.filter((r: any) => r.category === cat).length,
    revenue: reservations
      .filter((r: any) => r.rooms?.category === cat && (r.status === "checked_out" || r.status === "checked_in"))
      .reduce((s: number, r: any) => s + Number(r.total_amount), 0),
  }));

  const statusData = [
    { name: "Disponible", value: rooms.filter((r: any) => r.status === "available").length },
    { name: "Occupée", value: occupied },
    { name: "Nettoyage", value: rooms.filter((r: any) => r.status === "cleaning").length },
    { name: "Maintenance", value: rooms.filter((r: any) => r.status === "maintenance").length },
  ].filter((d) => d.value > 0);

  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString("fr-FR", { month: "short" });
    const amount = invoices
      .filter((inv: any) => inv.status === "paid" && inv.paid_at?.slice(0, 7) === key)
      .reduce((s: number, inv: any) => s + Number(inv.amount), 0);
    return { d: label, v: amount };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Analytics</h1>
        <p className="text-sm text-muted-foreground">Indicateurs clés de performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <BedDouble className="h-5 w-5 text-primary" />
            <div><div className="text-2xl font-semibold gradient-text">{occupancyRate}%</div><div className="text-xs text-muted-foreground">Taux d'occupation</div></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <div><div className="text-2xl font-semibold">€ {totalRevenue.toLocaleString()}</div><div className="text-xs text-muted-foreground">Revenus totaux</div></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <Users className="h-5 w-5 text-blue-400" />
            <div><div className="text-2xl font-semibold">{totalReservations}</div><div className="text-xs text-muted-foreground">Réservations</div></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <Clock className="h-5 w-5 text-amber-400" />
            <div><div className="text-2xl font-semibold">{avgStay} j</div><div className="text-xs text-muted-foreground">Durée moy. de séjour</div></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader><CardTitle>Revenus mensuels</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
                <XAxis dataKey="d" stroke="oklch(0.7 0.03 300)" />
                <YAxis stroke="oklch(0.7 0.03 300)" />
                <Tooltip contentStyle={{ background: "oklch(0.17 0.025 290)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }} />
                <Bar dataKey="v" fill="oklch(0.68 0.27 350)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader><CardTitle>Statut des chambres</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "oklch(0.17 0.025 290)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">Aucune donnée</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader><CardTitle>Revenus par catégorie</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="name" stroke="oklch(0.7 0.03 300)" />
              <YAxis stroke="oklch(0.7 0.03 300)" />
              <Tooltip contentStyle={{ background: "oklch(0.17 0.025 290)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12 }} />
              <Bar dataKey="revenue" fill="oklch(0.6 0.2 280)" radius={[6, 6, 0, 0]} name="Revenus (€)" />
              <Bar dataKey="rooms" fill="oklch(0.68 0.27 350)" radius={[6, 6, 0, 0]} name="Chambres" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
