import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, BedDouble, Brush, Wrench, Headset, BarChart3, MessageSquare, Receipt, ShieldCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LB Group — Plateforme tout-en-un pour hôtels & résidences" },
      { name: "description", content: "Un seul outil pour gérer réservations, réception, ménage, maintenance, conciergerie, finance et plus. Pensé pour les hôtels et appartements meublés modernes." },
      { property: "og:title", content: "LB Group — Hotel & Property Management" },
      { property: "og:description", content: "La plateforme premium pour gérer tout votre établissement depuis un seul tableau de bord." },
    ],
  }),
  component: Landing,
});

const modules = [
  { icon: BedDouble, label: "Réservations" },
  { icon: Brush, label: "Housekeeping" },
  { icon: Wrench, label: "Maintenance" },
  { icon: Headset, label: "Réception" },
  { icon: MessageSquare, label: "Conciergerie" },
  { icon: Receipt, label: "Facturation" },
  { icon: BarChart3, label: "Analytics" },
  { icon: ShieldCheck, label: "Direction" },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="container mx-auto flex items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl gradient-bg glow font-bold">LB</div>
          <span className="text-lg font-semibold tracking-tight">LB <span className="gradient-text">Group</span></span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#modules" className="hover:text-foreground">Modules</a>
          <a href="#why" className="hover:text-foreground">Pourquoi LB</a>
          <a href="#pricing" className="hover:text-foreground">Tarifs</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/auth"><Button variant="ghost">Connexion</Button></Link>
          <Link to="/auth"><Button className="gradient-bg glow">Démarrer</Button></Link>
        </div>
      </header>

      <section className="container mx-auto px-6 pt-16 pb-24 text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Nouveau · Plateforme tout-en-un v1
        </div>
        <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Un seul outil pour <span className="gradient-text">gérer tout</span><br />votre hôtel.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Réservations, réception, ménage, maintenance, conciergerie, finance, analytics — LB Group réunit tous vos modules dans une plateforme premium pensée pour les équipes terrain.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/auth">
            <Button size="lg" className="gradient-bg glow gap-2">
              Découvrir la plateforme <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#modules">
            <Button size="lg" variant="outline">Voir les modules</Button>
          </a>
        </div>

        <div className="mx-auto mt-16 flex max-w-3xl flex-wrap justify-center gap-2" id="modules">
          {modules.map((m) => (
            <span key={m.label} className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm backdrop-blur">
              <m.icon className="h-4 w-4 text-primary" /> {m.label}
            </span>
          ))}
        </div>

        {/* Dashboard mockup */}
        <div className="relative mx-auto mt-20 max-w-6xl">
          <div className="pointer-events-none absolute -inset-10 rounded-[2rem]" style={{ background: "var(--gradient-glow)" }} />
          <div className="glass relative overflow-hidden rounded-2xl p-1 glow">
            <div className="rounded-xl bg-background/80 p-6">
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { label: "Chambres", value: "48" },
                  { label: "Taux d'occupation", value: "82%" },
                  { label: "Demandes en attente", value: "7" },
                  { label: "Revenus du jour", value: "€ 6,420" },
                ].map((k) => (
                  <div key={k.label} className="rounded-xl border border-border bg-card/60 p-4 text-left">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">{k.label}</div>
                    <div className="mt-2 text-2xl font-semibold gradient-text">{k.value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2 h-56 rounded-xl border border-border bg-card/60 p-4">
                  <div className="text-sm text-muted-foreground">Tendance d'occupation</div>
                  <div className="mt-3 flex h-40 items-end gap-2">
                    {[40, 55, 48, 70, 62, 80, 75, 90, 85, 78, 92, 88].map((v, i) => (
                      <div key={i} className="flex-1 rounded-t gradient-bg" style={{ height: `${v}%`, opacity: 0.85 }} />
                    ))}
                  </div>
                </div>
                <div className="h-56 rounded-xl border border-border bg-card/60 p-4">
                  <div className="text-sm text-muted-foreground">Activité récente</div>
                  <ul className="mt-3 space-y-3 text-sm">
                    {["Check-in chambre 204", "Ménage terminé 312", "Demande taxi 105", "Maintenance climatisation"].map((t) => (
                      <li key={t} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full gradient-bg" />{t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="why" className="container mx-auto grid gap-6 px-6 py-20 md:grid-cols-3">
        {[
          { title: "Pensé pour les équipes terrain", desc: "Réception, ménage, maintenance — chaque rôle a son interface optimisée mobile-first." },
          { title: "Temps réel", desc: "Synchronisation instantanée entre tous les modules et toutes les équipes." },
          { title: "Premium par défaut", desc: "Une expérience digne d'un hôtel 5 étoiles, jusque dans votre back-office." },
        ].map((f) => (
          <div key={f.title} className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2025 LB Group · Tous droits réservés
      </footer>
    </div>
  );
}
