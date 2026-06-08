import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { Users } from "lucide-react";
export const Route = createFileRoute("/_authenticated/communication")({
  head: () => ({ meta: [{ title: "Communication interne — LB Group" }] }),
  component: () => <ModulePlaceholder title="Communication interne" description="Messagerie d équipe et annonces" icon={Users} features={["Messagerie entre équipes","Tableau des annonces","Notes de passation de service","Système de notifications"]} />,
});
