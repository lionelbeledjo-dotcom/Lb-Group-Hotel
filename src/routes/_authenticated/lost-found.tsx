import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchCheck, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/lost-found")({
  head: () => ({ meta: [{ title: "Objets trouvés — LB Group" }] }),
  component: LostFoundPage,
});

function LostFoundPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ item_name: "", description: "", location: "", status: "stored" });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["lost-found"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lost_found" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return [];
      return data as any[];
    },
  });

  const addItem = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");
      const { error } = await supabase.from("lost_found" as any).insert({
        ...form,
        found_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setOpen(false);
      setForm({ item_name: "", description: "", location: "", status: "stored" });
      qc.invalidateQueries({ queryKey: ["lost-found"] });
      toast.success("Objet enregistré !");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const returnItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lost_found" as any).update({ status: "returned" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lost-found"] });
      toast.success("Objet marqué comme rendu");
    },
  });

  const stored = items.filter((i: any) => i.status === "stored");
  const returned = items.filter((i: any) => i.status === "returned");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Objets trouvés</h1>
          <p className="text-sm text-muted-foreground">{stored.length} objet(s) en attente de réclamation</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-white"><Plus className="mr-2 h-4 w-4" /> Déclarer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Déclarer un objet trouvé</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Objet</Label><Input value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} placeholder="Portefeuille noir" /></div>
              <div><Label>Lieu trouvé</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Chambre 204, lobby..." /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Détails supplémentaires..." /></div>
              <Button className="w-full gradient-bg text-white" onClick={() => addItem.mutate()} disabled={!form.item_name || addItem.isPending}>
                {addItem.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Enregistrer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Objet</TableHead>
              <TableHead>Lieu</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucun objet trouvé enregistré</TableCell></TableRow>
            ) : items.map((i: any) => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.item_name}</TableCell>
                <TableCell className="text-sm">{i.location || "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{i.description || "—"}</TableCell>
                <TableCell className="text-sm">{new Date(i.created_at).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={i.status === "stored" ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"}>
                    {i.status === "stored" ? "En stock" : "Rendu"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {i.status === "stored" && (
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => returnItem.mutate(i.id)}>Rendre</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
