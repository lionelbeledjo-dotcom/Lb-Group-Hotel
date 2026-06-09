import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, BedDouble, TrendingUp, Clock, Users, FileDown } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { DEMO_ROOMS, DEMO_RESERVATIONS, DEMO_INVOICES } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — LB Group" }] }),
  component: AnalyticsPage,
});

const COLORS = ["oklch(0.35 0.12 250)", "oklch(0.75 0.16 85)", "oklch(0.7 0.15 200)", "oklch(0.65 0.2 140)"];

function AnalyticsPage() {
  const { data: rooms = [] } = useQuery({
    queryKey: ["analytics-rooms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("status, category, price_per_night");
      if (error) return DEMO_ROOMS;
      return data.length > 0 ? data : DEMO_ROOMS;
    },
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ["analytics-reservations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reservations").select("status, total_amount, check_in, check_out, rooms(category)");
      if (error) return DEMO_RESERVATIONS;
      return data.length > 0 ? data : DEMO_RESERVATIONS;
    },
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ["analytics-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("amount, status, paid_at");
      if (error) return DEMO_INVOICES;
      return data.length > 0 ? data : DEMO_INVOICES;
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

  function exportReport() {
    const today = new Date().toLocaleDateString("fr-FR");
    const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><title>Rapport Analytics — LB Group</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;padding:40px;color:#1a2744}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:30px;border-bottom:3px solid #1a2744;padding-bottom:16px}
.logo{font-size:24px;font-weight:700}.logo span{color:#c8a45c}
.date{font-size:12px;color:#666}
h2{font-size:16px;margin:24px 0 12px;border-bottom:1px solid #eee;padding-bottom:8px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
.stat{border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center}
.stat .value{font-size:24px;font-weight:700;color:#1a2744}
.stat .label{font-size:11px;color:#666;margin-top:4px}
table{width:100%;border-collapse:collapse;margin:12px 0}
th{background:#1a2744;color:#fff;padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase}
td{padding:8px 12px;border-bottom:1px solid #eee;font-size:13px}
.footer{margin-top:40px;text-align:center;font-size:10px;color:#999;border-top:1px solid #eee;padding-top:16px}
@media print{body{padding:20px}}
</style></head><body>
<div class="header"><div><div class="logo">LB <span>Group</span></div><div class="date">Rapport généré le ${today}</div></div></div>
<h2>Indicateurs clés</h2>
<div class="grid">
<div class="stat"><div class="value">${occupancyRate}%</div><div class="label">Taux d'occupation</div></div>
<div class="stat"><div class="value">${totalRevenue.toLocaleString("fr-FR")} FCFA</div><div class="label">Revenus totaux</div></div>
<div class="stat"><div class="value">${totalReservations}</div><div class="label">Réservations</div></div>
<div class="stat"><div class="value">${avgStay} jours</div><div class="label">Durée moy. séjour</div></div>
</div>
<h2>Revenus mensuels</h2>
<table><thead><tr><th>Mois</th><th>Revenus</th></tr></thead><tbody>
${monthlyRevenue.map((m) => `<tr><td>${m.d}</td><td>${m.v.toLocaleString("fr-FR")} FCFA</td></tr>`).join("")}
</tbody></table>
<h2>Répartition par catégorie</h2>
<table><thead><tr><th>Catégorie</th><th>Chambres</th><th>Revenus</th></tr></thead><tbody>
${categoryData.map((c) => `<tr><td>${c.name}</td><td>${c.rooms}</td><td>${c.revenue.toLocaleString("fr-FR")} FCFA</td></tr>`).join("")}
</tbody></table>
<h2>Statut des chambres</h2>
<table><thead><tr><th>Statut</th><th>Nombre</th></tr></thead><tbody>
${statusData.map((s) => `<tr><td>${s.name}</td><td>${s.value}</td></tr>`).join("")}
</tbody></table>
<div class="footer"><p>LB Group — Gestion Hôtelière Professionnelle</p><p>+33 6 60 06 17 23 — lbcloudadmin@gmail.com</p></div>
</body></html>`;
    const w = window.open("", "_blank", "width=800,height=600");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.onload = () => w.print();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Analytics</h1>
          <p className="text-sm text-muted-foreground">Indicateurs clés de performance</p>
        </div>
        <Button variant="outline" onClick={exportReport}><FileDown className="mr-2 h-4 w-4" /> Exporter PDF</Button>
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
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 250)" />
                <XAxis dataKey="d" stroke="oklch(0.5 0.02 250)" />
                <YAxis stroke="oklch(0.5 0.02 250)" />
                <Tooltip contentStyle={{ background: "oklch(0.99 0.005 250)", border: "1px solid oklch(0.9 0.01 250)", borderRadius: 12 }} />
                <Bar dataKey="v" fill="oklch(0.35 0.12 250)" radius={[6, 6, 0, 0]} />
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
                  <Tooltip contentStyle={{ background: "oklch(0.99 0.005 250)", border: "1px solid oklch(0.9 0.01 250)", borderRadius: 12 }} />
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
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 250)" />
              <XAxis dataKey="name" stroke="oklch(0.5 0.02 250)" />
              <YAxis stroke="oklch(0.5 0.02 250)" />
              <Tooltip contentStyle={{ background: "oklch(0.99 0.005 250)", border: "1px solid oklch(0.9 0.01 250)", borderRadius: 12 }} />
              <Bar dataKey="revenue" fill="oklch(0.75 0.16 85)" radius={[6, 6, 0, 0]} name="Revenus (€)" />
              <Bar dataKey="rooms" fill="oklch(0.35 0.12 250)" radius={[6, 6, 0, 0]} name="Chambres" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
