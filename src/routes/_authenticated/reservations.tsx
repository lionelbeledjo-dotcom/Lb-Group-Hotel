import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";
import { CalendarDays } from "lucide-react";
export const Route = createFileRoute("/_authenticated/reservations")({
  head: () => ({ meta: [{ title: "Réservations — LB Group" }] }),
  component: () => <ModulePlaceholder title="Réservations" description="Calendrier et gestion des séjours" icon={CalendarDays} features={["Vue calendrier mois/semaine/jour","Création / modification / annulation","Assignation des chambres","Statuts: confirmé, check-in, check-out, annulé, no-show"]} />,
});
