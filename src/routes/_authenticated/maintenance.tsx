import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { Wrench } from "lucide-react";
export const Route = createFileRoute("/_authenticated/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance — LB Group" }] }),
  component: () => <ModulePlaceholder title="Maintenance" description="Tickets, priorités et suivi" icon={Wrench} features={["Création de tickets","Priorités: basse, moyenne, haute, urgente","Assignation aux techniciens","Inventaire d équipements","Maintenance préventive"]} />,
});
