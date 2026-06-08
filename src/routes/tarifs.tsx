import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Star } from "lucide-react";

export const Route = createFileRoute("/tarifs")({
  head: () => ({ meta: [{ title: "Tarifs — LB Group" }] }),
  component: TarifsPage,
});

const plans = [
  {
    name: "Starter",
    price: "29 000",
    period: "/ mois",
    description: "Pour les petits établissements (1-10 chambres)",
    popular: false,
    features: [
      "Jusqu'à 10 chambres",
      "Module Réservations",
      "Module Réception",
      "Module Housekeeping",
      "Support email",
      "1 utilisateur admin",
    ],
  },
  {
    name: "Business",
    price: "79 000",
    period: "/ mois",
    description: "Pour les hôtels moyens (11-50 chambres)",
    popular: true,
    features: [
      "Jusqu'à 50 chambres",
      "Tous les modules inclus",
      "Analytics avancés",
      "Facturation automatique",
      "Support prioritaire 24/7",
      "5 utilisateurs",
      "Rapports PDF",
      "API accès",
    ],
  },
  {
    name: "Enterprise",
    price: "149 000",
    period: "/ mois",
    description: "Pour les grands établissements (50+ chambres)",
    popular: false,
    features: [
      "Chambres illimitées",
      "Tous les modules inclus",
      "Multi-établissements",
      "Analytics en temps réel",
      "Intégrations personnalisées",
      "Utilisateurs illimités",
      "Account manager dédié",
      "Formation sur site",
      "SLA garanti 99.9%",
    ],
  },
];

function TarifsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-border bg-white/80 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-bg font-bold text-white text-sm">LB</div>
            <span className="text-xl font-bold">LB <span className="gold-text">Group</span></span>
          </Link>
          <Link to="/"><Button variant="ghost"><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button></Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 max-w-6xl">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Des tarifs <span className="gold-text">transparents</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choisissez le forfait adapté à la taille de votre établissement. Tous les prix sont en FCFA, sans frais cachés.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Essai gratuit de 14 jours · Sans engagement · Annulation à tout moment</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? "border-2 border-[oklch(0.75_0.16_85)] shadow-xl scale-105" : "glass"}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gold-bg text-[oklch(0.15_0.03_250)] font-semibold px-3">
                    <Star className="mr-1 h-3 w-3" /> Populaire
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2 pt-8">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm"> FCFA {plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="/#demo">
                  <Button className={`w-full ${plan.popular ? "gold-bg text-[oklch(0.15_0.03_250)] font-semibold gold-glow" : "gradient-bg text-white"}`}>
                    Commencer l'essai gratuit
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">Besoin d'un forfait personnalisé pour votre chaîne hôtelière ?</p>
          <Link to="/contact"><Button variant="outline" size="lg">Contactez-nous</Button></Link>
        </div>
      </main>
    </div>
  );
}
