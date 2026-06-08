import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { Settings } from "lucide-react";
export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Paramètres — LB Group" }] }),
  component: () => <ModulePlaceholder title="Paramètres" description="Configuration de votre établissement" icon={Settings} features={["Profil de l hôtel","Catégories de chambres et tarification","Gestion du personnel","Préférences de notifications","Templates de checklists"]} />,
});
