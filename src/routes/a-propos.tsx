import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Globe, Users, Award, Target } from "lucide-react";

export const Route = createFileRoute("/a-propos")({
  head: () => ({ meta: [{ title: "À propos — LB Group" }] }),
  component: AProposPage,
});

function AProposPage() {
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

      <main className="container mx-auto px-6 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>À propos de <span className="gold-text">LB Group</span></h1>
        <p className="text-lg text-muted-foreground mb-12">Nous révolutionnons la gestion hôtelière en Afrique et dans le monde.</p>

        <div className="grid gap-8 md:grid-cols-2 mb-16">
          {[
            { icon: Target, title: "Notre mission", desc: "Fournir aux hôtels, résidences et appartements meublés une plateforme tout-en-un moderne, intuitive et accessible qui remplace les outils fragmentés et les processus manuels." },
            { icon: Globe, title: "Notre vision", desc: "Devenir la référence mondiale en gestion hôtelière digitale, en commençant par l'Afrique francophone où les besoins sont immenses et les solutions adaptées rares." },
            { icon: Users, title: "Notre équipe", desc: "Une équipe passionnée de développeurs, designers et experts de l'hôtellerie qui comprennent les défis terrain des établissements en Afrique et en Europe." },
            { icon: Award, title: "Nos valeurs", desc: "Innovation, simplicité, fiabilité. Nous croyons que la technologie doit simplifier le travail, pas le compliquer. Chaque fonctionnalité est pensée pour l'utilisateur final." },
          ].map((item) => (
            <Card key={item.title} className="glass">
              <CardContent className="p-6">
                <item.icon className="h-8 w-8 text-[oklch(0.35_0.12_250)] mb-3" />
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Prêt à nous rejoindre ?</h2>
          <Link to="/"><Button className="gradient-bg text-white font-semibold glow">Découvrir LB Group</Button></Link>
        </div>
      </main>
    </div>
  );
}
