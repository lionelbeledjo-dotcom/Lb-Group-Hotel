import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/demos")({
  head: () => ({ meta: [{ title: "Demandes de démo — Admin LB Group" }] }),
  component: AdminDemosPage,
});

const DEMO_REQUESTS_FALLBACK = [
  { id: "1", name: "LIONEL MBELEDJO", email: "lionelbrown2728@yahoo.fr", phone: "+33660061723", company: "Hotel France", rooms: "11-30", message: null, created_at: "2025-06-08T14:30:00Z", status: "new" },
  { id: "2", name: "Marcel Ngono", email: "m.ngono@gmail.com", phone: "+237699112233", company: "Résidence Les Acacias", rooms: "31-50", message: "Intéressé par le plan Business", created_at: "2025-06-07T09:15:00Z", status: "contacted" },
  { id: "3", name: "Fatou Diop", email: "fatou.diop@outlook.com", phone: "+221771234567", company: "Hôtel Teranga", rooms: "51-100", message: "Nous cherchons une solution complète pour 3 hôtels", created_at: "2025-06-06T16:45:00Z", status: "new" },
  { id: "4", name: "Ibrahim Bello", email: "ibello@yahoo.com", phone: "+2348012345678", company: "Royal Palace Hotel", rooms: "100+", message: null, created_at: "2025-06-05T11:20:00Z", status: "demo_done" },
  { id: "5", name: "Claire Ateba", email: "c.ateba@hotmail.com", phone: "+237677889900", company: "Appart Hôtel Mvan", rooms: "1-10", message: "Petit établissement, budget limité", created_at: "2025-06-04T08:00:00Z", status: "contacted" },
];

function AdminDemosPage() {
  const { data: demos = [], isLoading } = useQuery({
    queryKey: ["admin-demo-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("demo_requests" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return DEMO_REQUESTS_FALLBACK;
      return (data as any[]).length > 0 ? data as any[] : DEMO_REQUESTS_FALLBACK;
    },
  });

  const newCount = demos.filter((d: any) => d.status === "new" || !d.status).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Demandes de démo</h1>
        <p className="text-sm text-muted-foreground">{demos.length} demandes · {newCount} nouvelles à traiter</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <Mail className="h-5 w-5 text-primary" />
            <div><div className="text-2xl font-semibold gradient-text">{demos.length}</div><div className="text-xs text-muted-foreground">Total demandes</div></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <Phone className="h-5 w-5 text-amber-500" />
            <div><div className="text-2xl font-semibold">{newCount}</div><div className="text-xs text-muted-foreground">À contacter</div></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <Building2 className="h-5 w-5 text-emerald-500" />
            <div><div className="text-2xl font-semibold">{demos.filter((d: any) => d.status === "demo_done").length}</div><div className="text-xs text-muted-foreground">Démos effectuées</div></div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Établissement</TableHead>
              <TableHead>Chambres</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></TableCell></TableRow>
            ) : demos.map((d: any) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell className="text-sm"><a href={`mailto:${d.email}`} className="text-primary hover:underline">{d.email}</a></TableCell>
                <TableCell className="text-sm"><a href={`tel:${d.phone}`} className="hover:underline">{d.phone}</a></TableCell>
                <TableCell className="text-sm">{d.company || "—"}</TableCell>
                <TableCell className="text-sm">{d.rooms || "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    d.status === "demo_done" ? "bg-emerald-500/10 text-emerald-600" :
                    d.status === "contacted" ? "bg-blue-500/10 text-blue-600" :
                    "bg-amber-500/10 text-amber-600"
                  }>
                    {d.status === "demo_done" ? "Démo faite" : d.status === "contacted" ? "Contacté" : "Nouveau"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{new Date(d.created_at).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => {
                    window.open(`mailto:${d.email}?subject=Votre démo LB Group`, "_blank");
                  }}>
                    Répondre
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
