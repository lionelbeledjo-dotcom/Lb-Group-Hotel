import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { Headset } from "lucide-react";
export const Route = createFileRoute("/_authenticated/reception")({
  head: () => ({ meta: [{ title: "Réception — LB Group" }] }),
  component: () => <ModulePlaceholder title="Réception" description="Check-in / check-out rapide" icon={Headset} features={["Flux check-in / check-out","Scan de pièce d identité","Gestion des cartes-clés","Récap de facture client","Enregistrement walk-in"]} />,
});
