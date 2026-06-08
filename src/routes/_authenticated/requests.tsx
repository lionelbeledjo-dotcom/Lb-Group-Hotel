import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { MessageSquare } from "lucide-react";
export const Route = createFileRoute("/_authenticated/requests")({
  head: () => ({ meta: [{ title: "Conciergerie — LB Group" }] }),
  component: () => <ModulePlaceholder title="Conciergerie" description="Demandes des clients en direct" icon={MessageSquare} features={["Demandes clients (serviettes, room service, taxi...)","Board temps réel pour le staff","Historique avec timestamps","Communication style chat"]} />,
});
