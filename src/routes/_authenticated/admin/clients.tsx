import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Users, MapPin } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/clients")({
  head: () => ({ meta: [{ title: "Hôtels clients — Admin LB Group" }] }),
  component: AdminClientsPage,
});

const DEMO_CLIENTS = [
  { id: "1", name: "Hôtel Le Marin", city: "Douala", rooms: 45, plan: "Business", status: "active", owner: "Jean-Pierre M.", created_at: "2025-03-15" },
  { id: "2", name: "Résidence Prestige", city: "Yaoundé", rooms: 28, plan: "Business", status: "active", owner: "Aminata D.", created_at: "2025-04-02" },
  { id: "3", name: "Appart Hotel Central", city: "Douala", rooms: 60, plan: "Enterprise", status: "active", owner: "Paul K.", created_at: "2025-02-20" },
  { id: "4", name: "Villa Bassa Lodge", city: "Kribi", rooms: 12, plan: "Starter", status: "active", owner: "Marie F.", created_at: "2025-05-10" },
  { id: "5", name: "Hôtel des Palmiers", city: "Bafoussam", rooms: 32, plan: "Business", status: "trial", owner: "Thomas N.", created_at: "2025-06-01" },
  { id: "6", name: "Le Rocher Suites", city: "Limbe", rooms: 18, plan: "Starter", status: "trial", owner: "Sandra A.", created_at: "2025-06-05" },
  { id: "7", name: "Grand Hôtel du Plateau", city: "Yaoundé", rooms: 85, plan: "Enterprise", status: "active", owner: "Georges E.", created_at: "2025-01-08" },
];

function AdminClientsPage() {
  const activeCount = DEMO_CLIENTS.filter(c => c.status === "active").length;
  const trialCount = DEMO_CLIENTS.filter(c => c.status === "trial").length;
  const totalRooms = DEMO_CLIENTS.reduce((s, c) => s + c.rooms, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Hôtels clients</h1>
        <p className="text-sm text-muted-foreground">Gestion de tous les établissements utilisant LB Group</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <Building2 className="h-5 w-5 text-primary" />
            <div><div className="text-2xl font-semibold gradient-text">{DEMO_CLIENTS.length}</div><div className="text-xs text-muted-foreground">Établissements</div></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <Users className="h-5 w-5 text-emerald-500" />
            <div><div className="text-2xl font-semibold">{activeCount} actifs / {trialCount} essai</div><div className="text-xs text-muted-foreground">Statut</div></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <MapPin className="h-5 w-5 text-blue-500" />
            <div><div className="text-2xl font-semibold">{totalRooms}</div><div className="text-xs text-muted-foreground">Chambres gérées</div></div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Établissement</TableHead>
              <TableHead>Propriétaire</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Chambres</TableHead>
              <TableHead>Forfait</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Inscrit le</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DEMO_CLIENTS.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-sm">{c.owner}</TableCell>
                <TableCell className="text-sm">{c.city}</TableCell>
                <TableCell>{c.rooms}</TableCell>
                <TableCell><Badge variant="outline" className="bg-primary/10 text-primary">{c.plan}</Badge></TableCell>
                <TableCell>
                  <Badge variant="outline" className={c.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}>
                    {c.status === "active" ? "Actif" : "Essai"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{new Date(c.created_at).toLocaleDateString("fr-FR")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
