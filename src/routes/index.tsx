import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import {
  BedDouble, Brush, Wrench, Headset, BarChart3, MessageSquare, Receipt, ShieldCheck,
  ArrowRight, CheckCircle2, Star, Phone, Mail, MapPin, Globe, Users, Clock, Shield,
  Zap, Heart, Award, ChevronRight, Play,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LB Group — Plateforme de gestion hôtelière tout-en-un" },
      { name: "description", content: "Gérez votre hôtel, résidence ou appartement meublé avec LB Group. Réservations, réception, housekeeping, maintenance, finance — tout en un." },
    ],
  }),
  component: Landing,
});

const modules = [
  { icon: BedDouble, label: "Réservations", desc: "Calendrier, création et suivi de tous les séjours" },
  { icon: Brush, label: "Housekeeping", desc: "Tâches de ménage, checklists, scores qualité" },
  { icon: Wrench, label: "Maintenance", desc: "Tickets, priorités, assignation aux techniciens" },
  { icon: Headset, label: "Réception", desc: "Check-in / check-out en un clic" },
  { icon: MessageSquare, label: "Conciergerie", desc: "Demandes clients en temps réel" },
  { icon: Receipt, label: "Facturation", desc: "Factures auto, paiements multi-méthodes" },
  { icon: BarChart3, label: "Analytics", desc: "KPIs, taux d'occupation, graphiques" },
  { icon: ShieldCheck, label: "Direction", desc: "Vision globale, rapports, contrôle total" },
];

const stats = [
  { value: "500+", label: "Établissements" },
  { value: "98%", label: "Satisfaction" },
  { value: "24/7", label: "Support" },
  { value: "15min", label: "Mise en place" },
];

const testimonials = [
  { name: "Jean-Pierre M.", role: "Directeur, Hôtel Le Marin", text: "LB Group a transformé notre gestion quotidienne. L'équipe est 3x plus efficace depuis qu'on l'utilise." },
  { name: "Aminata D.", role: "Gérante, Résidence Prestige", text: "Interface intuitive, modules complets. Je recommande à tous les professionnels de l'hébergement." },
  { name: "Paul K.", role: "Propriétaire, Appart Hotel Central", text: "Le meilleur investissement que j'ai fait pour mon business. ROI positif dès le premier mois." },
];

function Landing() {
  const [demoForm, setDemoForm] = useState({
    name: "", email: "", phone: "", company: "", rooms: "", message: "",
  });
  const [demoSent, setDemoSent] = useState(false);

  function handleDemo(e: React.FormEvent) {
    e.preventDefault();
    setDemoSent(true);
    toast.success("Demande envoyée ! Notre équipe vous contactera sous 24h.");
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-bg font-bold text-white text-sm">LB</div>
            <span className="text-xl font-bold tracking-tight text-[oklch(0.2_0.06_250)]">LB <span className="gold-text">Group</span></span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[oklch(0.4_0.03_250)] md:flex">
            <a href="#modules" className="hover:text-[oklch(0.2_0.06_250)] transition-colors">Modules</a>
            <a href="#avantages" className="hover:text-[oklch(0.2_0.06_250)] transition-colors">Avantages</a>
            <a href="#temoignages" className="hover:text-[oklch(0.2_0.06_250)] transition-colors">Témoignages</a>
            <a href="#demo" className="hover:text-[oklch(0.2_0.06_250)] transition-colors">Démo</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="outline" className="hidden sm:flex">Se connecter</Button></Link>
            <a href="#demo"><Button className="gold-bg text-[oklch(0.15_0.03_250)] font-semibold gold-glow">Demander une démo</Button></a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.2_0.06_250)] via-[oklch(0.25_0.08_250)] to-[oklch(0.3_0.1_250)]" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.2_0.06_250)] via-transparent to-transparent" />
        <div className="relative container mx-auto px-6 py-20 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur border border-white/20">
              <Star className="h-4 w-4 text-[oklch(0.8_0.16_85)]" />
              Plateforme N°1 de gestion hôtelière en Afrique
            </div>
            <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Un seul outil pour{" "}
              <span className="gold-text">gérer tout</span>{" "}
              votre établissement
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/75 leading-relaxed">
              Réservations, réception, housekeeping, maintenance, conciergerie, finance et analytics.
              LB Group centralise toute la gestion de votre hôtel ou résidence dans une plateforme moderne et intuitive.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a href="#demo">
                <Button size="lg" className="gold-bg text-[oklch(0.15_0.03_250)] font-bold text-base px-8 gold-glow">
                  Demander une démo gratuite <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </a>
              <a href="#modules">
                <Button size="lg" variant="outline" className="border-white/30 text-white bg-white/10 hover:bg-white/20 text-base px-8">
                  <Play className="mr-2 h-5 w-5" /> Découvrir les modules
                </Button>
              </a>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mx-auto mt-16 max-w-3xl">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="rounded-xl bg-white/10 backdrop-blur border border-white/15 p-4 text-center">
                  <div className="text-2xl font-bold gold-text">{s.value}</div>
                  <div className="text-xs text-white/70 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section id="modules" className="container mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Tous les modules dont vous avez <span className="gold-text">besoin</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Une plateforme complète qui couvre chaque aspect de la gestion de votre établissement.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {modules.map((m) => (
            <Card key={m.label} className="glass group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default">
              <CardContent className="p-6">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl gradient-bg">
                  <m.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{m.label}</h3>
                <p className="text-sm text-muted-foreground">{m.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* AVANTAGES */}
      <section id="avantages" className="bg-[oklch(0.96_0.005_250)] py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold md:text-4xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Pourquoi choisir <span className="gradient-text">LB Group</span> ?
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Zap, title: "Rapide à déployer", desc: "Installation en 15 minutes. Aucune formation technique requise. Votre équipe est opérationnelle dès le premier jour." },
              { icon: Shield, title: "Sécurisé & fiable", desc: "Données chiffrées, sauvegardes automatiques, hébergement cloud haute disponibilité. Conformité RGPD." },
              { icon: Clock, title: "Support 24/7", desc: "Notre équipe vous accompagne à chaque étape. Support prioritaire par chat, email et téléphone." },
              { icon: Globe, title: "Accessible partout", desc: "Web, tablette, smartphone. Gérez votre établissement depuis n'importe où dans le monde." },
              { icon: Users, title: "Multi-rôles", desc: "Admin, réceptionniste, housekeeper, maintenance — chaque membre a son interface dédiée." },
              { icon: Heart, title: "Pensé pour l'Afrique", desc: "Paiement Mobile Money, langues locales, adapté aux contraintes terrain du continent." },
            ].map((f) => (
              <div key={f.title} className="flex gap-4">
                <div className="flex-shrink-0 grid h-12 w-12 place-items-center rounded-xl bg-[oklch(0.35_0.12_250/0.1)]">
                  <f.icon className="h-6 w-6 text-[oklch(0.35_0.12_250)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEMOIGNAGES */}
      <section id="temoignages" className="container mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold md:text-4xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Ils nous font <span className="gold-text">confiance</span>
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="glass">
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-[oklch(0.75_0.16_85)] text-[oklch(0.75_0.16_85)]" />)}
                </div>
                <p className="text-sm text-muted-foreground italic mb-4">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* DEMO FORM */}
      <section id="demo" className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.2_0.06_250)] to-[oklch(0.28_0.08_250)]" />
        <div className="relative container mx-auto px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="text-white">
              <h2 className="text-3xl font-bold md:text-4xl mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Demandez votre <span className="gold-text">démo gratuite</span>
              </h2>
              <p className="text-white/75 text-lg mb-8">
                Remplissez le formulaire et notre équipe vous contactera sous 24h pour une démonstration personnalisée de LB Group.
              </p>
              <div className="space-y-4">
                {[
                  { icon: CheckCircle2, text: "Démonstration personnalisée de 30 minutes" },
                  { icon: CheckCircle2, text: "Configuration offerte par notre équipe" },
                  { icon: CheckCircle2, text: "Essai gratuit de 14 jours — sans engagement" },
                  { icon: CheckCircle2, text: "Support dédié pendant la mise en place" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-[oklch(0.8_0.16_85)]" />
                    <span className="text-white/90">{item.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-10 flex items-center gap-6 text-white/70 text-sm">
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +33 6 60 06 17 23</div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> lbcloudadmin@gmail.com</div>
              </div>
            </div>

            <Card className="bg-white shadow-2xl border-0">
              <CardContent className="p-8">
                {demoSent ? (
                  <div className="text-center py-10">
                    <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Demande envoyée !</h3>
                    <p className="text-muted-foreground">Notre équipe vous contactera sous 24h pour planifier votre démonstration.</p>
                  </div>
                ) : (
                  <form onSubmit={handleDemo} className="space-y-4">
                    <h3 className="text-xl font-bold mb-4">Vos coordonnées</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Nom complet *</Label><Input required value={demoForm.name} onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })} placeholder="Jean Dupont" /></div>
                      <div><Label>Email *</Label><Input required type="email" value={demoForm.email} onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })} placeholder="jean@hotel.com" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Téléphone *</Label><Input required value={demoForm.phone} onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })} placeholder="+237 6XX XXX XXX" /></div>
                      <div><Label>Nom de l'établissement *</Label><Input required value={demoForm.company} onChange={(e) => setDemoForm({ ...demoForm, company: e.target.value })} placeholder="Hôtel Prestige" /></div>
                    </div>
                    <div>
                      <Label>Nombre de chambres</Label>
                      <Select value={demoForm.rooms} onValueChange={(v) => setDemoForm({ ...demoForm, rooms: v })}>
                        <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1 à 10</SelectItem>
                          <SelectItem value="11-30">11 à 30</SelectItem>
                          <SelectItem value="31-50">31 à 50</SelectItem>
                          <SelectItem value="51-100">51 à 100</SelectItem>
                          <SelectItem value="100+">Plus de 100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Message (optionnel)</Label>
                      <Textarea value={demoForm.message} onChange={(e) => setDemoForm({ ...demoForm, message: e.target.value })} placeholder="Précisez vos besoins..." className="min-h-[80px]" />
                    </div>
                    <Button type="submit" size="lg" className="w-full gold-bg text-[oklch(0.15_0.03_250)] font-bold text-base gold-glow">
                      Demander ma démo gratuite <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">En soumettant, vous acceptez d'être recontacté par notre équipe.</p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold md:text-3xl mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Prêt à transformer votre gestion hôtelière ?
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">Rejoignez les centaines d'établissements qui font confiance à LB Group.</p>
        <div className="flex justify-center gap-4">
          <a href="#demo"><Button size="lg" className="gradient-bg text-white font-semibold glow">Commencer maintenant</Button></a>
          <Link to="/login"><Button size="lg" variant="outline">Se connecter</Button></Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-[oklch(0.96_0.005_250)] py-12">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg gradient-bg font-bold text-white text-xs">LB</div>
                <span className="font-bold">LB Group</span>
              </div>
              <p className="text-sm text-muted-foreground">La plateforme de gestion hôtelière la plus complète du marché.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Produit</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#modules" className="hover:text-foreground transition-colors">Modules</a></li>
                <li><a href="#avantages" className="hover:text-foreground transition-colors">Avantages</a></li>
                <li><a href="#demo" className="hover:text-foreground transition-colors">Demander une démo</a></li>
                <li><Link to="/tarifs" className="hover:text-foreground transition-colors">Tarifs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Entreprise</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/a-propos" className="hover:text-foreground transition-colors">À propos</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                <li><Link to="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</Link></li>
                <li><Link to="/confidentialite" className="hover:text-foreground transition-colors">Confidentialité</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Nous contacter</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> <a href="tel:+33660061723" className="hover:text-foreground transition-colors">+33 6 60 06 17 23</a></li>
                <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> <a href="mailto:lbcloudadmin@gmail.com" className="hover:text-foreground transition-colors">lbcloudadmin@gmail.com</a></li>
                <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> France / Cameroun</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 LB Group · Tous droits réservés
          </div>
        </div>
      </footer>
    </div>
  );
}
