import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DEMO_CONTRACTS } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/contracts")({
  head: () => ({ meta: [{ title: "Contrats — LB Group" }] }),
  component: ContractsPage,
});

function ContractsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", provider: "", type: "service", start_date: "", end_date: "", amount: "" });

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["contracts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return DEMO_CONTRACTS;
      return (data as any[]).length > 0 ? data as any[] : DEMO_CONTRACTS;
    },
  });

  const addContract = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");
      const { error } = await supabase.from("contracts" as any).insert({
        title: form.title,
        provider: form.provider,
        type: form.type,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        amount: form.amount ? parseFloat(form.amount) : null,
        owner_id: user.id,
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setOpen(false);
      setForm({ title: "", provider: "", type: "service", start_date: "", end_date: "", amount: "" });
      qc.invalidateQueries({ queryKey: ["contracts"] });
      toast.success("Contrat ajouté !");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const today = new Date().toISOString().slice(0, 10);

  function getStatus(c: any) {
    if (c.status === "terminated") return { label: "Résilié", color: "bg-red-500/10 text-red-600 border-red-500/30" };
    if (c.end_date && c.end_date < today) return { label: "Expiré", color: "bg-amber-500/10 text-amber-600 border-amber-500/30" };
    return { label: "Actif", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Mes contrats</h1>
          <p className="text-sm text-muted-foreground">Fournisseurs, services et engagements</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-white"><Plus className="mr-2 h-4 w-4" /> Nouveau contrat</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau contrat</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Titre</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Contrat nettoyage" /></div>
              <div><Label>Fournisseur / Prestataire</Label><Input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="Société XYZ" /></div>
              <div><Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="fournisseur">Fournisseur</SelectItem>
                    <SelectItem value="emploi">Emploi</SelectItem>
                    <SelectItem value="location">Location</SelectItem>
                    <SelectItem value="assurance">Assurance</SelectItem>
                    <SelectItem value="autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Début</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
                <div><Label>Fin</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
              </div>
              <div><Label>Montant (FCFA/mois)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Optionnel" /></div>
              <Button className="w-full gradient-bg text-white" onClick={() => addContract.mutate()} disabled={!form.title || addContract.isPending}>
                {addContract.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Enregistrer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contrat</TableHead>
              <TableHead>Prestataire</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Période</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></TableCell></TableRow>
            ) : contracts.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground"><FileText className="mx-auto mb-2 h-8 w-8" />Aucun contrat enregistré</TableCell></TableRow>
            ) : contracts.map((c: any) => {
              const s = getStatus(c);
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>{c.provider || "—"}</TableCell>
                  <TableCell className="text-sm capitalize">{c.type}</TableCell>
                  <TableCell className="text-sm">
                    {c.start_date ? new Date(c.start_date).toLocaleDateString("fr-FR") : "—"}
                    {c.end_date ? ` → ${new Date(c.end_date).toLocaleDateString("fr-FR")}` : ""}
                  </TableCell>
                  <TableCell className="font-medium">{c.amount ? `${Number(c.amount).toLocaleString()} FCFA` : "—"}</TableCell>
                  <TableCell><Badge variant="outline" className={s.color}>{s.label}</Badge></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
