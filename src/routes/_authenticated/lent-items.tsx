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
import { Package, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/lent-items")({
  head: () => ({ meta: [{ title: "Objets prêtés — LB Group" }] }),
  component: LentItemsPage,
});

function LentItemsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ item_name: "", guest_name: "", room: "", quantity: "1" });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["lent-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lent_items" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return [];
      return data as any[];
    },
  });

  const lendItem = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");
      const { error } = await supabase.from("lent_items" as any).insert({
        item_name: form.item_name,
        guest_name: form.guest_name,
        room: form.room || null,
        quantity: parseInt(form.quantity) || 1,
        lent_by: user.id,
        status: "lent",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setOpen(false);
      setForm({ item_name: "", guest_name: "", room: "", quantity: "1" });
      qc.invalidateQueries({ queryKey: ["lent-items"] });
      toast.success("Objet prêté enregistré !");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const returnItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lent_items" as any).update({ status: "returned", returned_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["lent-items"] });
      toast.success("Objet retourné !");
    },
  });

  const active = items.filter((i: any) => i.status === "lent");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Objets prêtés</h1>
          <p className="text-sm text-muted-foreground">{active.length} objet(s) actuellement prêté(s)</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-white"><Plus className="mr-2 h-4 w-4" /> Prêter un objet</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Prêter un objet</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Objet</Label><Input value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} placeholder="Fer à repasser, adaptateur..." /></div>
              <div><Label>Client</Label><Input value={form.guest_name} onChange={(e) => setForm({ ...form, guest_name: e.target.value })} placeholder="Nom du client" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Chambre</Label><Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="204" /></div>
                <div><Label>Quantité</Label><Input type="number" min="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
              </div>
              <Button className="w-full gradient-bg text-white" onClick={() => lendItem.mutate()} disabled={!form.item_name || !form.guest_name || lendItem.isPending}>
                {lendItem.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirmer le prêt
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
              <TableHead>Client</TableHead>
              <TableHead>Chambre</TableHead>
              <TableHead>Qté</TableHead>
              <TableHead>Prêté le</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Aucun objet prêté</TableCell></TableRow>
            ) : items.map((i: any) => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.item_name}</TableCell>
                <TableCell>{i.guest_name}</TableCell>
                <TableCell>{i.room || "—"}</TableCell>
                <TableCell>{i.quantity}</TableCell>
                <TableCell className="text-sm">{new Date(i.created_at).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={i.status === "lent" ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"}>
                    {i.status === "lent" ? "Prêté" : "Retourné"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {i.status === "lent" && (
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => returnItem.mutate(i.id)}>Retourné</Button>
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
