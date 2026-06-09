import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCheck, Users, Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Utilisateurs — Admin LB Group" }] }),
  component: AdminUsersPage,
});

const DEMO_USERS = [
  { id: "1", name: "Lionel Mbeledjo", email: "lbcloudadmin@gmail.com", role: "super_admin", hotel: "—", last_login: "2025-06-08", status: "active" },
  { id: "2", name: "Jean-Pierre Kamga", email: "jpkamga@gmail.com", role: "admin", hotel: "Hôtel Le Marin", last_login: "2025-06-08", status: "active" },
  { id: "3", name: "Aminata Diallo", email: "aminata.d@gmail.com", role: "admin", hotel: "Résidence Prestige", last_login: "2025-06-07", status: "active" },
  { id: "4", name: "Paul Kouam", email: "pkouam@outlook.com", role: "admin", hotel: "Appart Hotel Central", last_login: "2025-06-06", status: "active" },
  { id: "5", name: "Jeanne Meka", email: "jmeka@gmail.com", role: "housekeeper", hotel: "Hôtel Le Marin", last_login: "2025-06-08", status: "active" },
  { id: "6", name: "Michel Fouda", email: "mfouda@yahoo.fr", role: "maintenance", hotel: "Hôtel Le Marin", last_login: "2025-06-07", status: "active" },
  { id: "7", name: "Sandra Atangana", email: "s.atangana@gmail.com", role: "receptionist", hotel: "Le Rocher Suites", last_login: "2025-06-05", status: "active" },
  { id: "8", name: "Thomas Ngono", email: "t.ngono@hotmail.com", role: "admin", hotel: "Hôtel des Palmiers", last_login: "2025-06-04", status: "trial" },
];

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin hôtel",
  receptionist: "Réceptionniste",
  housekeeper: "Housekeeping",
  maintenance: "Maintenance",
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-purple-500/10 text-purple-600",
  admin: "bg-blue-500/10 text-blue-600",
  receptionist: "bg-emerald-500/10 text-emerald-600",
  housekeeper: "bg-amber-500/10 text-amber-600",
  maintenance: "bg-orange-500/10 text-orange-600",
};

function AdminUsersPage() {
  const admins = DEMO_USERS.filter(u => u.role === "admin" || u.role === "super_admin").length;
  const staff = DEMO_USERS.filter(u => u.role !== "admin" && u.role !== "super_admin").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Utilisateurs</h1>
        <p className="text-sm text-muted-foreground">Tous les utilisateurs de la plateforme LB Group</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <Users className="h-5 w-5 text-primary" />
            <div><div className="text-2xl font-semibold gradient-text">{DEMO_USERS.length}</div><div className="text-xs text-muted-foreground">Total utilisateurs</div></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <Shield className="h-5 w-5 text-blue-500" />
            <div><div className="text-2xl font-semibold">{admins}</div><div className="text-xs text-muted-foreground">Administrateurs</div></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <UserCheck className="h-5 w-5 text-emerald-500" />
            <div><div className="text-2xl font-semibold">{staff}</div><div className="text-xs text-muted-foreground">Staff opérationnel</div></div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Hôtel</TableHead>
              <TableHead>Dernière connexion</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DEMO_USERS.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="text-sm">{u.email}</TableCell>
                <TableCell><Badge variant="outline" className={ROLE_COLORS[u.role]}>{ROLE_LABELS[u.role]}</Badge></TableCell>
                <TableCell className="text-sm">{u.hotel}</TableCell>
                <TableCell className="text-sm">{new Date(u.last_login).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={u.status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}>
                    {u.status === "active" ? "Actif" : "Essai"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
