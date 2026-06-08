import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Check, Star, Users, TrendingUp, Loader2, Smartphone, Building } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/subscriptions")({
  head: () => ({ meta: [{ title: "Abonnements — LB Group" }] }),
  component: SubscriptionsPage,
});

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: 29000,
    priceLabel: "29 000",
    features: ["10 chambres", "3 modules", "1 utilisateur", "Support email"],
    color: "border-gray-300",
  },
  {
    id: "business",
    name: "Business",
    price: 79000,
    priceLabel: "79 000",
    features: ["50 chambres", "Tous modules", "5 utilisateurs", "Support 24/7", "Rapports PDF"],
    color: "border-[oklch(0.75_0.16_85)]",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 149000,
    priceLabel: "149 000",
    features: ["Illimité", "Multi-sites", "Utilisateurs illimités", "Manager dédié", "SLA 99.9%"],
    color: "border-[oklch(0.35_0.12_250)]",
  },
];

const PAYMENT_METHODS = [
  { id: "card", label: "Carte bancaire (Stripe)", icon: CreditCard, desc: "Visa, Mastercard" },
  { id: "mobile_money", label: "Mobile Money", icon: Smartphone, desc: "MTN MoMo, Orange Money" },
  { id: "bank_transfer", label: "Virement bancaire", icon: Building, desc: "Paiement sous 48h" },
];

function SubscriptionsPage() {
  const qc = useQueryClient();
  const [checkoutPlan, setCheckoutPlan] = useState<typeof plans[0] | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const { data: subscribers = [] } = useQuery({
    queryKey: ["subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return [];
      return data as any[];
    },
  });

  const { data: currentSub } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("subscriptions" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();
      return data as any;
    },
  });

  const subscribe = useMutation({
    mutationFn: async () => {
      if (!checkoutPlan) throw new Error("Aucun plan sélectionné");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      if (paymentMethod === "card") {
        // Stripe checkout - on crée un pending record et on simule la redirection
        const { error } = await supabase.from("subscriptions" as any).upsert({
          user_id: user.id,
          plan: checkoutPlan.id,
          status: "pending",
          amount: checkoutPlan.price,
          payment_method: "card",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }, { onConflict: "user_id" });
        if (error) throw error;
        // TODO: Rediriger vers Stripe Checkout quand la clé API est configurée
        // Pour l'instant on simule le succès
        await supabase.from("subscriptions" as any).update({ status: "active" }).eq("user_id", user.id);
      } else if (paymentMethod === "mobile_money") {
        const { error } = await supabase.from("subscriptions" as any).upsert({
          user_id: user.id,
          plan: checkoutPlan.id,
          status: "pending",
          amount: checkoutPlan.price,
          payment_method: "mobile_money",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }, { onConflict: "user_id" });
        if (error) throw error;
        // TODO: Intégrer avec CinetPay / Flutterwave pour Mobile Money
        await supabase.from("subscriptions" as any).update({ status: "active" }).eq("user_id", user.id);
      } else {
        const { error } = await supabase.from("subscriptions" as any).upsert({
          user_id: user.id,
          plan: checkoutPlan.id,
          status: "pending",
          amount: checkoutPlan.price,
          payment_method: "bank_transfer",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }, { onConflict: "user_id" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      setCheckoutPlan(null);
      qc.invalidateQueries({ queryKey: ["my-subscription"] });
      qc.invalidateQueries({ queryKey: ["subscribers"] });
      if (paymentMethod === "bank_transfer") {
        toast.success("Abonnement en attente — envoyez le virement pour activation.");
      } else {
        toast.success("Abonnement activé avec succès !");
      }
    },
    onError: (e: any) => toast.error(e.message),
  });

  const activeCount = subscribers.filter((s: any) => s.status === "active").length;
  const trialCount = subscribers.filter((s: any) => s.status === "trial").length;
  const mrr = subscribers.filter((s: any) => s.status === "active").reduce((sum: number, s: any) => sum + Number(s.amount || 0), 0);

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

      {currentSub && (
        <Card className="glass border-2 border-[oklch(0.75_0.16_85)]">
          <CardContent className="py-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Votre abonnement actuel</p>
              <p className="text-lg font-semibold gold-text capitalize">{currentSub.plan}</p>
            </div>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
              {currentSub.status === "active" ? "Actif" : currentSub.status}
            </Badge>
          </CardContent>
        </Card>
      )}

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
                <div className="mt-2"><span className="text-3xl font-bold">{plan.priceLabel}</span> <span className="text-sm text-muted-foreground">FCFA/mois</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500" /> {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${currentSub?.plan === plan.id ? "" : "gradient-bg text-white font-semibold"}`}
                  variant={currentSub?.plan === plan.id ? "outline" : "default"}
                  disabled={currentSub?.plan === plan.id}
                  onClick={() => setCheckoutPlan(plan)}
                >
                  {currentSub?.plan === plan.id ? "Plan actuel" : "S'abonner"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {subscribers.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Clients abonnés</h2>
          <Card className="glass overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Forfait</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.user_id?.slice(0, 8)}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{s.plan}</Badge></TableCell>
                    <TableCell className="text-sm capitalize">{s.payment_method?.replace("_", " ") || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        s.status === "active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" :
                        s.status === "pending" ? "bg-amber-500/10 text-amber-600 border-amber-500/30" :
                        "bg-red-500/10 text-red-600 border-red-500/30"
                      }>
                        {s.status === "active" ? "Actif" : s.status === "pending" ? "En attente" : s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{Number(s.amount).toLocaleString()} FCFA</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Checkout Dialog */}
      <Dialog open={!!checkoutPlan} onOpenChange={(open) => !open && setCheckoutPlan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Souscrire au forfait {checkoutPlan?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4 text-center">
              <p className="text-sm text-muted-foreground">Montant mensuel</p>
              <p className="text-3xl font-bold mt-1">{checkoutPlan?.priceLabel} <span className="text-sm font-normal text-muted-foreground">FCFA/mois</span></p>
            </div>

            <div>
              <Label className="text-sm font-medium">Méthode de paiement</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-2 space-y-2">
                {PAYMENT_METHODS.map((m) => (
                  <label key={m.id} className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${paymentMethod === m.id ? "border-primary bg-primary/5" : "border-border"}`}>
                    <RadioGroupItem value={m.id} />
                    <m.icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>
            </div>

            <Button
              className="w-full gradient-bg text-white font-semibold"
              onClick={() => subscribe.mutate()}
              disabled={subscribe.isPending}
            >
              {subscribe.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer le paiement
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              En confirmant, vous acceptez nos conditions d'utilisation. Annulation possible à tout moment.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
