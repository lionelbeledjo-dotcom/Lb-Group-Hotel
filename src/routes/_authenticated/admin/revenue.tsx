import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/admin/revenue")({
  head: () => ({ meta: [{ title: "Revenus & MRR — Admin LB Group" }] }),
  component: AdminRevenuePage,
});

const monthlyData = [
  { month: "Jan", mrr: 180000, clients: 3 },
  { month: "Fév", mrr: 238000, clients: 4 },
  { month: "Mar", mrr: 297000, clients: 5 },
  { month: "Avr", mrr: 356000, clients: 5 },
  { month: "Mai", mrr: 415000, clients: 6 },
  { month: "Jun", mrr: 503000, clients: 7 },
];

const planBreakdown = [
  { plan: "Starter", count: 2, revenue: 58000 },
  { plan: "Business", count: 3, revenue: 237000 },
  { plan: "Enterprise", count: 2, revenue: 208000 },
];

function AdminRevenuePage() {
  const currentMRR = 503000;
  const lastMRR = 415000;
  const growth = Math.round(((currentMRR - lastMRR) / lastMRR) * 100);
  const arr = currentMRR * 12;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Revenus & MRR</h1>
        <p className="text-sm text-muted-foreground">Suivi des revenus récurrents de la plateforme</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="glass">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">MRR</div>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold gradient-text mt-1">{currentMRR.toLocaleString()} FCFA</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600">
              <ArrowUpRight className="h-3 w-3" /> +{growth}% vs mois dernier
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">ARR (annuel)</div>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold mt-1">{arr.toLocaleString()} FCFA</div>
            <div className="text-xs text-muted-foreground mt-1">Projection annuelle</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Clients payants</div>
              <Users className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold mt-1">7</div>
            <div className="text-xs text-muted-foreground mt-1">5 actifs + 2 essai</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">ARPU</div>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold mt-1">{Math.round(currentMRR / 7).toLocaleString()} FCFA</div>
            <div className="text-xs text-muted-foreground mt-1">Revenu moyen / client</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader><CardTitle>Évolution MRR (6 mois)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyData}>
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
          <CardHeader><CardTitle>Revenus par forfait</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={planBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.01 250)" />
                <XAxis dataKey="plan" stroke="oklch(0.5 0.02 250)" />
                <YAxis stroke="oklch(0.5 0.02 250)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString()} FCFA`} contentStyle={{ background: "oklch(0.99 0.005 250)", border: "1px solid oklch(0.9 0.01 250)", borderRadius: 12 }} />
                <Bar dataKey="revenue" fill="oklch(0.75 0.16 85)" radius={[6, 6, 0, 0]} name="Revenu" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass">
        <CardHeader><CardTitle>Détail par forfait</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {planBreakdown.map((p) => (
              <div key={p.plan} className="rounded-xl border border-border p-4">
                <div className="text-sm font-semibold text-primary">{p.plan}</div>
                <div className="mt-2 text-2xl font-bold">{p.count} <span className="text-sm font-normal text-muted-foreground">clients</span></div>
                <div className="text-sm text-muted-foreground">{p.revenue.toLocaleString()} FCFA/mois</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
