import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { Brush } from "lucide-react";
export const Route = createFileRoute("/_authenticated/housekeeping")({
  head: () => ({ meta: [{ title: "Housekeeping — LB Group" }] }),
  component: () => <ModulePlaceholder title="Housekeeping" description="Suivi du ménage en temps réel" icon={Brush} features={["Liste des chambres à nettoyer","Assignation aux équipes","Statuts: en attente, en cours, terminé, inspecté","Checklists par type de chambre","Scores qualité"]} />,
});
