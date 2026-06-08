import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { Receipt } from "lucide-react";
export const Route = createFileRoute("/_authenticated/finance")({
  head: () => ({ meta: [{ title: "Finance & Facturation — LB Group" }] }),
  component: () => <ModulePlaceholder title="Finance & Facturation" description="Revenus, paiements, dépenses" icon={Receipt} features={["Factures auto-générées par séjour","Suivi des paiements (cash, carte, mobile money, virement)","Rapport quotidien de revenus","Bilan financier mensuel","Suivi des dépenses"]} />,
});
