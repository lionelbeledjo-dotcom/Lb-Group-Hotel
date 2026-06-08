import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { BarChart3 } from "lucide-react";
export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — LB Group" }] }),
  component: () => <ModulePlaceholder title="Analytics" description="Tableaux de bord et insights" icon={BarChart3} features={["Taux d occupation dans le temps","Revenus par catégorie","Durée moyenne de séjour","Scores de satisfaction client","Performance du personnel","Export PDF"]} />,
});
