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
import { ClipboardCheck, Plus, Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { DEMO_QUALITY } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/quality")({
  head: () => ({ meta: [{ title: "Contrôles qualités — LB Group" }] }),
  component: QualityPage,
});

function QualityPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ room: "", score: "8", notes: "", category: "general" });

  const { data: controls = [], isLoading } = useQuery({
    queryKey: ["quality-controls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quality_controls" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return DEMO_QUALITY;
      return (data as any[]).length > 0 ? data as any[] : DEMO_QUALITY;
    },
  });

  const addControl = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");
      const { error } = await supabase.from("quality_controls" as any).insert({
        room: form.room,
        score: parseInt(form.score),
        notes: form.notes || null,
        category: form.category,
        inspector_id: user.id,
        inspector_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Inspecteur",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setOpen(false);
      setForm({ room: "", score: "8", notes: "", category: "general" });
      qc.invalidateQueries({ queryKey: ["quality-controls"] });
      toast.success("Contrôle enregistré !");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const avgScore = controls.length > 0
    ? (controls.reduce((s: number, c: any) => s + Number(c.score), 0) / controls.length).toFixed(1)
    : "—";

  function scoreColor(score: number) {
    if (score >= 8) return "text-emerald-600";
    if (score >= 5) return "text-amber-600";
    return "text-red-600";
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Contrôles qualités</h1>
          <p className="text-sm text-muted-foreground">Score moyen : <span className="font-semibold">{avgScore}/10</span></p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-white"><Plus className="mr-2 h-4 w-4" /> Nouveau contrôle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau contrôle qualité</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Chambre / Zone</Label><Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="Chambre 204, Lobby..." /></div>
                <div><Label>Score (/10)</Label><Input type="number" min="0" max="10" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} /></div>
              </div>
              <div><Label>Catégorie</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Général</SelectItem>
                    <SelectItem value="chambre">Chambre</SelectItem>
                    <SelectItem value="salle_de_bain">Salle de bain</SelectItem>
                    <SelectItem value="parties_communes">Parties communes</SelectItem>
                    <SelectItem value="exterieur">Extérieur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Observations</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Points à améliorer..." /></div>
              <Button className="w-full gradient-bg text-white" onClick={() => addControl.mutate()} disabled={!form.room || addControl.isPending}>
                {addControl.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Enregistrer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zone</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Inspecteur</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></TableCell></TableRow>
            ) : controls.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground"><ClipboardCheck className="mx-auto mb-2 h-8 w-8" />Aucun contrôle effectué</TableCell></TableRow>
            ) : controls.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.room}</TableCell>
                <TableCell className="text-sm capitalize">{c.category?.replace("_", " ")}</TableCell>
                <TableCell>
                  <span className={`font-bold ${scoreColor(c.score)}`}>{c.score}/10</span>
                </TableCell>
                <TableCell className="text-sm">{c.inspector_name}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{c.notes || "—"}</TableCell>
                <TableCell className="text-sm">{new Date(c.created_at).toLocaleDateString("fr-FR")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
