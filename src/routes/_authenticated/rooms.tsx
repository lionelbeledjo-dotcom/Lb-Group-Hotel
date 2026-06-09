import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Plus, BedDouble } from "lucide-react";
import { toast } from "sonner";
import { DEMO_ROOMS } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/rooms")({
  head: () => ({ meta: [{ title: "Chambres — LB Group" }] }),
  component: RoomsPage,
});

const STATUS_COLORS: Record<string, string> = {
  available: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  occupied: "bg-primary/20 text-primary border-primary/30",
  cleaning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  maintenance: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  reserved: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

function RoomsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ number: "", floor: "0", category: "standard", price_per_night: "0", status: "available" });

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("*").order("number");
      if (error) return DEMO_ROOMS;
      return data.length > 0 ? data : DEMO_ROOMS;
    },
  });

  const createRoom = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("rooms").insert({
        number: form.number,
        floor: parseInt(form.floor) || 0,
        category: form.category as any,
        price_per_night: parseFloat(form.price_per_night) || 0,
        status: form.status as any,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Chambre créée");
      setOpen(false);
      setForm({ number: "", floor: "0", category: "standard", price_per_night: "0", status: "available" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("rooms").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rooms"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Chambres</h1>
          <p className="text-sm text-muted-foreground">{rooms.length} chambres · gestion en temps réel</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg"><Plus className="mr-2 h-4 w-4" /> Nouvelle chambre</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle chambre</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Numéro</Label><Input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} /></div>
              <div><Label>Étage</Label><Input type="number" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} /></div>
              <div>
                <Label>Catégorie</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="deluxe">Deluxe</SelectItem>
                    <SelectItem value="suite">Suite</SelectItem>
                    <SelectItem value="apartment">Appartement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Prix / nuit (€)</Label><Input type="number" value={form.price_per_night} onChange={(e) => setForm({ ...form, price_per_night: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button onClick={() => createRoom.mutate()} disabled={!form.number} className="gradient-bg">Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {rooms.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center text-muted-foreground">
            <BedDouble className="mx-auto mb-3 h-10 w-10 text-primary" />
            Aucune chambre. Cliquez sur "Nouvelle chambre" pour commencer.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rooms.map((r: any) => (
            <Card key={r.id} className="glass">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">N° {r.number}</CardTitle>
                  <Badge variant="outline" className={STATUS_COLORS[r.status]}>{r.status}</Badge>
                </div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{r.category} · Étage {r.floor}</div>
              </CardHeader>
              <CardContent>
                <div className="mb-3 text-lg font-semibold gradient-text">€ {Number(r.price_per_night).toFixed(0)}<span className="text-xs text-muted-foreground"> / nuit</span></div>
                <Select value={r.status} onValueChange={(v) => updateStatus.mutate({ id: r.id, status: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["available","occupied","cleaning","maintenance","reserved"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}