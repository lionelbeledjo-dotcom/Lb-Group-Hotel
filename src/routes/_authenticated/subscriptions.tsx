import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useRouteContext } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreditCard, Users, TrendingUp, AlertCircle, Check, MoreHorizontal,
  ArrowUpRight, ArrowDownRight, Calendar, DollarSign, Eye, Pause, Trash2, RefreshCw,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated/subscriptions")({
  head: () => ({ meta: [{ title: "Abonnements — LB Group" }] }),
  component: SubscriptionsPage,
});

const PLANS = [
  { id: "starter", name: "Starter", price: 29000, features: ["10 chambres", "3 modules", "1 utilisateur", "Support email"] },
  { id: "business", name: "Business", price: 79000, features: ["50 chambres", "Tous modules", "5 utilisateurs", "Support 24/7", "Rapports PDF"] },
  { id: "enterprise", name: "Enterprise", price: 149000, features: ["Illimité", "Multi-sites", "Utilisateurs illimités", "Manager dédié", "SLA 99.9%"] },
];

const DEMO_SUBSCRIBERS = [
  { id: "1", hotel: "Hôtel Le Marin", owner: "Jean-Pierre Kamga", email: "jpkamga@gmail.com", plan: "business", amount: 79000, status: "active", method: "Mobile Money", started: "2025-03-15", next_billing: "2025-07-15", city: "Douala" },
  { id: "2", hotel: "Résidence Prestige", owner: "Aminata Diallo", email: "aminata.d@gmail.com", plan: "business", amount: 79000, status: "active", method: "Carte bancaire", started: "2025-04-02", next_billing: "2025-07-02", city: "Yaoundé" },
  { id: "3", hotel: "Appart Hotel Central", owner: "Paul Kouam", email: "pkouam@outlook.com", plan: "enterprise", amount: 149000, status: "active", method: "Virement", started: "2025-02-20", next_billing: "2025-07-20", city: "Douala" },
  { id: "4", hotel: "Villa Bassa Lodge", owner: "Marie Fouda", email: "mfouda@gmail.com", plan: "starter", amount: 29000, status: "active", method: "Mobile Money", started: "2025-05-10", next_billing: "2025-07-10", city: "Kribi" },
  { id: "5", hotel: "Hôtel des Palmiers", owner: "Thomas Ngono", email: "t.ngono@hotmail.com", plan: "business", amount: 79000, status: "trial", method: "—", started: "2025-06-01", next_billing: "2025-07-01", city: "Bafoussam" },
  { id: "6", hotel: "Le Rocher Suites", owner: "Sandra Atangana", email: "s.atangana@gmail.com", plan: "starter", amount: 29000, status: "trial", method: "—", started: "2025-06-05", next_billing: "2025-07-05", city: "Limbe" },
  { id: "7", hotel: "Grand Hôtel du Plateau", owner: "Georges Essomba", email: "g.essomba@yahoo.fr", plan: "enterprise", amount: 149000, status: "active", method: "Carte bancaire", started: "2025-01-08", next_billing: "2025-07-08", city: "Yaoundé" },
  { id: "8", hotel: "Sunset Resort Kribi", owner: "Fabrice Ndam", email: "f.ndam@gmail.com", plan: "business", amount: 79000, status: "past_due", method: "Mobile Money", started: "2025-04-18", next_billing: "2025-06-18", city: "Kribi" },
];

function SubscriptionsPage() {
  const [selectedSub, setSelectedSub] = useState<typeof DEMO_SUBSCRIBERS[0] | null>(null);

  const activeCount = DEMO_SUBSCRIBERS.filter(s => s.status === "active").length;
  const trialCount = DEMO_SUBSCRIBERS.filter(s => s.status === "trial").length;
  const pastDueCount = DEMO_SUBSCRIBERS.filter(s => s.status === "past_due").length;
  const mrr = DEMO_SUBSCRIBERS.filter(s => s.status === "active").reduce((sum, s) => sum + s.amount, 0);
  const lastMonthMrr = 415000;
  const mrrGrowth = Math.round(((mrr - lastMonthMrr) / lastMonthMrr) * 100);

  const planDistribution = PLANS.map(p => ({
    ...p,
    count: DEMO_SUBSCRIBERS.filter(s => s.plan === p.id && s.status === "active").length,
    revenue: DEMO_SUBSCRIBERS.filter(s => s.plan === p.id && s.status === "active").reduce((sum, s) => sum + s.amount, 0),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Gestion des abonnements</h1>
          <p className="text-sm text-muted-foreground">Suivi de tous les clients abonnés et revenus de la plateforme</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="glass">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Abonnés actifs</div>
              <Users className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold mt-1">{activeCount}</div>
            <div className="text-xs text-muted-foreground mt-1">{trialCount} en essai gratuit</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">MRR</div>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold gradient-text mt-1">{mrr.toLocaleString()} FCFA</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600">
              <ArrowUpRight className="h-3 w-3" /> +{mrrGrowth}% vs mois dernier
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">ARR (annuel)</div>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold mt-1">{(mrr * 12).toLocaleString()} FCFA</div>
            <div className="text-xs text-muted-foreground mt-1">Projection annuelle</div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">Impayés</div>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-600 mt-1">{pastDueCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Paiement en retard</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {planDistribution.map((p) => (
          <Card key={p.id} className="glass">
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">{p.name}</span>
                <Badge variant="outline" className="text-xs">{p.price.toLocaleString()} FCFA/mois</Badge>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{p.count}</span>
                <span className="text-xs text-muted-foreground">clients actifs</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">{p.revenue.toLocaleString()} FCFA/mois</div>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full gradient-bg" style={{ width: `${activeCount > 0 ? (p.count / activeCount) * 100 : 0}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tous les abonnés</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600">{activeCount} actifs</Badge>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600">{trialCount} essai</Badge>
            <Badge variant="outline" className="bg-red-500/10 text-red-600">{pastDueCount} impayés</Badge>
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hôtel</TableHead>
              <TableHead>Propriétaire</TableHead>
              <TableHead>Forfait</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Méthode</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Prochaine facturation</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DEMO_SUBSCRIBERS.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="font-medium">{s.hotel}</div>
                  <div className="text-xs text-muted-foreground">{s.city}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{s.owner}</div>
                  <div className="text-xs text-muted-foreground">{s.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    s.plan === "enterprise" ? "bg-purple-500/10 text-purple-600" :
                    s.plan === "business" ? "bg-blue-500/10 text-blue-600" :
                    "bg-gray-500/10 text-gray-600"
                  }>
                    {s.plan.charAt(0).toUpperCase() + s.plan.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{s.amount.toLocaleString()} FCFA</TableCell>
                <TableCell className="text-sm">{s.method}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    s.status === "active" ? "bg-emerald-500/10 text-emerald-600" :
                    s.status === "trial" ? "bg-amber-500/10 text-amber-600" :
                    "bg-red-500/10 text-red-600"
                  }>
                    {s.status === "active" ? "Actif" : s.status === "trial" ? "Essai" : "Impayé"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{new Date(s.next_billing).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedSub(s)}>
                        <Eye className="mr-2 h-4 w-4" /> Voir détails
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <RefreshCw className="mr-2 h-4 w-4" /> Changer de forfait
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pause className="mr-2 h-4 w-4" /> Suspendre
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Résilier
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="glass">
        <CardHeader><CardTitle>Grille tarifaire actuelle</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div key={plan.id} className="rounded-xl border border-border p-5">
                <div className="text-lg font-semibold">{plan.name}</div>
                <div className="text-2xl font-bold mt-1">{plan.price.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">FCFA/mois</span></div>
                <ul className="mt-3 space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedSub} onOpenChange={(open) => !open && setSelectedSub(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails abonnement — {selectedSub?.hotel}</DialogTitle>
          </DialogHeader>
          {selectedSub && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Propriétaire</div>
                  <div className="font-medium mt-1">{selectedSub.owner}</div>
                  <div className="text-xs text-muted-foreground">{selectedSub.email}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Forfait</div>
                  <div className="font-medium mt-1 capitalize">{selectedSub.plan}</div>
                  <div className="text-xs text-muted-foreground">{selectedSub.amount.toLocaleString()} FCFA/mois</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Méthode de paiement</div>
                  <div className="font-medium mt-1">{selectedSub.method}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Statut</div>
                  <div className="font-medium mt-1 capitalize">{selectedSub.status === "active" ? "Actif" : selectedSub.status === "trial" ? "Essai gratuit" : "Impayé"}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Date de début</div>
                  <div className="font-medium mt-1">{new Date(selectedSub.started).toLocaleDateString("fr-FR")}</div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Prochaine facturation</div>
                  <div className="font-medium mt-1">{new Date(selectedSub.next_billing).toLocaleDateString("fr-FR")}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">Envoyer un rappel</Button>
                <Button className="flex-1 gradient-bg text-white font-semibold">Modifier le forfait</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
