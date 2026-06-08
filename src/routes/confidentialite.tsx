import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({ meta: [{ title: "Politique de confidentialité — LB Group" }] }),
  component: ConfidentialitePage,
});

function ConfidentialitePage() {
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
        <h1 className="text-3xl font-bold mb-8" style={{ fontFamily: "'Poppins', sans-serif" }}>Politique de confidentialité</h1>

        <p className="text-muted-foreground">Dernière mise à jour : juin 2025</p>

        <h2 className="text-xl font-semibold mt-8 mb-3">Données collectées</h2>
        <p className="text-muted-foreground">
          Nous collectons les données suivantes lors de l'utilisation de LB Group :
        </p>
        <ul className="text-muted-foreground space-y-1 list-disc pl-6">
          <li>Nom, email, téléphone (lors de l'inscription ou demande de démo)</li>
          <li>Données d'utilisation de la plateforme (réservations, actions)</li>
          <li>Données techniques (adresse IP, navigateur, appareil)</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">Utilisation des données</h2>
        <p className="text-muted-foreground">Vos données sont utilisées pour :</p>
        <ul className="text-muted-foreground space-y-1 list-disc pl-6">
          <li>Fournir et améliorer nos services</li>
          <li>Vous contacter suite à une demande de démo</li>
          <li>Assurer la sécurité de la plateforme</li>
          <li>Envoyer des communications relatives au service (avec votre consentement)</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-3">Partage des données</h2>
        <p className="text-muted-foreground">
          Nous ne vendons jamais vos données. Elles peuvent être partagées avec nos sous-traitants techniques
          (Supabase, Cloudflare) uniquement dans le cadre de la fourniture du service.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">Sécurité</h2>
        <p className="text-muted-foreground">
          Les données sont chiffrées en transit (TLS) et au repos. L'accès est protégé par authentification
          et contrôle d'accès basé sur les rôles (RBAC).
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">Vos droits</h2>
        <p className="text-muted-foreground">
          Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité
          de vos données. Contactez-nous à lbcloudadmin@gmail.com pour exercer ces droits.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">Cookies</h2>
        <p className="text-muted-foreground">
          Nous utilisons des cookies strictement nécessaires au fonctionnement de la plateforme (session d'authentification).
          Aucun cookie publicitaire ou de tracking n'est utilisé.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-3">Contact</h2>
        <p className="text-muted-foreground">
          Pour toute question relative à la protection de vos données : lbcloudadmin@gmail.com
        </p>
      </main>
    </div>
  );
}
