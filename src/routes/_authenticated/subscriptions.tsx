import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Check, Star, Users, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/_authenticated/subscriptions")({
  head: () => ({ meta: [{ title: "Abonnements — LB Group" }] }),
  component: SubscriptionsPage,
});

const plans = [
  {
    name: "Starter",
    price: "29 000",
    features: ["10 chambres", "3 modules", "1 utilisateur", "Support email"],
    color: "border-gray-300",
  },
  {
    name: "Business",
    price: "79 000",
    features: ["50 chambres", "Tous modules", "5 utilisateurs", "Support 24/7", "Rapports PDF"],
    color: "border-[oklch(0.75_0.16_85)]",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "149 000",
    features: ["Illimité", "Multi-sites", "Utilisateurs illimités", "Manager dédié", "SLA 99.9%"],
    color: "border-[oklch(0.35_0.12_250)]",
  },
];

const mockSubscribers = [
  { id: 1, name: "Hôtel Le Marin", plan: "Business", status: "active", since: "2025-03-15", amount: "79 000" },
  { id: 2, name: "Résidence Prestige", plan: "Starter", status: "active", since: "2025-04-02", amount: "29 000" },
  { id: 3, name: "Appart Hotel Central", plan: "Enterprise", status: "active", since: "2025-01-20", amount: "149 000" },
  { id: 4, name: "Villa Cocotiers", plan: "Starter", status: "trial", since: "2025-06-01", amount: "0" },
  { id: 5, name: "Hôtel Akwa Palace", plan: "Business", status: "expired", since: "2025-02-10", amount: "79 000" },
];

function SubscriptionsPage() {
  const activeCount = mockSubscribers.filter((s) => s.status === "active").length;
  const trialCount = mockSubscribers.filter((s) => s.status === "trial").length;
  const mrr = mockSubscribers.filter((s) => s.status === "active").reduce((sum, s) => sum + parseInt(s.amount.replace(/\s/g, "")), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Abonnements</h1>
        <p className="text-sm text-muted-foreground">Gestion des forfaits et suivi des revenus récurrents</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <Users className="h-5 w-5 text-[oklch(0.35_0.12_250)]" />
            <div><div className="text-2xl font-semibold">{activeCount}</div><div className="text-xs text-muted-foreground">Abonnés actifs</div></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <Star className="h-5 w-5 text-amber-500" />
            <div><div className="text-2xl font-semibold">{trialCount}</div><div className="text-xs text-muted-foreground">En essai gratuit</div></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <div><div className="text-2xl font-semibold gold-text">{mrr.toLocaleString()} FCFA</div><div className="text-xs text-muted-foreground">MRR (revenu mensuel)</div></div>
          </CardContent>
        </Card>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Forfaits disponibles</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={`glass border-2 ${plan.color} relative`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gold-bg text-[oklch(0.15_0.03_250)] font-semibold"><Star className="mr-1 h-3 w-3" />Populaire</Badge>
                </div>
              )}
              <CardHeader className="text-center pt-6">
                <CardTitle>{plan.name}</CardTitle>
                <div className="mt-2"><span className="text-3xl font-bold">{plan.price}</span> <span className="text-sm text-muted-foreground">FCFA/mois</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Subscribers table */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Clients abonnés</h2>
        <Card className="glass overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Établissement</TableHead>
                <TableHead>Forfait</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Depuis</TableHead>
                <TableHead>Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSubscribers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell><Badge variant="outline">{s.plan}</Badge></TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      s.status === "active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" :
                      s.status === "trial" ? "bg-amber-500/10 text-amber-600 border-amber-500/30" :
                      "bg-red-500/10 text-red-600 border-red-500/30"
                    }>
                      {s.status === "active" ? "Actif" : s.status === "trial" ? "Essai" : "Expiré"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{s.since}</TableCell>
                  <TableCell className="font-medium">{s.amount === "0" ? "Gratuit" : `${s.amount} FCFA`}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
