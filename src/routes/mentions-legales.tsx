import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({ meta: [{ title: "Mentions légales — LB Group" }] }),
  component: MentionsLegalesPage,
});

function MentionsLegalesPage() {
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

      <main className="container mx-auto px-6 py-16 max-w-3xl prose prose-neutral">
        <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: "'Poppins', sans-serif" }}>Mentions légales</h1>

        <h2 className="text-xl font-semibold mt-8 mb-3">Éditeur du site</h2>
        <p className="text-muted-foreground">
          LB Group<br />
          Email : lbcloudadmin@gmail.com<br />
          Téléphone : +33 6 60 06 17 23<br />
          Siège : France / Cameroun
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">Hébergement</h2>
        <p className="text-muted-foreground">
          Le site est hébergé par Lovable / Cloudflare Workers.<br />
          Les données sont stockées sur les serveurs Supabase (Union Européenne).
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">Propriété intellectuelle</h2>
        <p className="text-muted-foreground">
          L'ensemble du contenu de ce site (textes, images, logos, logiciel) est la propriété exclusive de LB Group.
          Toute reproduction, même partielle, est interdite sans autorisation écrite préalable.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">Responsabilité</h2>
        <p className="text-muted-foreground">
          LB Group s'efforce d'assurer l'exactitude des informations diffusées sur ce site.
          Toutefois, LB Group ne peut garantir l'exactitude, la complétude ou l'actualité des informations.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">Contact</h2>
        <p className="text-muted-foreground">
          Pour toute question relative aux mentions légales, veuillez nous contacter à : lbcloudadmin@gmail.com
        </p>
      </main>
    </div>
  );
}
