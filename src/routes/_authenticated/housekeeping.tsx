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
import { Plus, Brush, CheckCircle2, Clock, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { DEMO_HOUSEKEEPING, DEMO_ROOMS } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/housekeeping")({
  head: () => ({ meta: [{ title: "Housekeeping — LB Group" }] }),
  component: HousekeepingPage,
});

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  in_progress: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  done: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  inspected: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  in_progress: "En cours",
  done: "Terminé",
  inspected: "Inspecté",
};

const STATUS_ICONS: Record<string, any> = {
  pending: Clock,
  in_progress: Loader2,
  done: CheckCircle2,
  inspected: Eye,
};

function HousekeepingPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ room_id: "", assigned_to: "", notes: "" });

  const { data: tasks = [] } = useQuery({
    queryKey: ["housekeeping-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("housekeeping_tasks")
        .select("*, rooms(number, category, floor)")
        .order("created_at", { ascending: false });
      if (error) return DEMO_HOUSEKEEPING;
      return data.length > 0 ? data : DEMO_HOUSEKEEPING;
    },
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("id, number, category, floor").order("number");
      if (error) return DEMO_ROOMS;
      return data.length > 0 ? data : DEMO_ROOMS;
    },
  });

  const createTask = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("housekeeping_tasks").insert({
        room_id: form.room_id,
        assigned_to: form.assigned_to || null,
        notes: form.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["housekeeping-tasks"] });
      toast.success("Tâche créée");
      setOpen(false);
      setForm({ room_id: "", assigned_to: "", notes: "" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("housekeeping_tasks").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["housekeeping-tasks"] });
      toast.success("Statut mis à jour");
    },
  });

  const updateScore = useMutation({
    mutationFn: async ({ id, score }: { id: string; score: number }) => {
      const { error } = await supabase.from("housekeeping_tasks").update({ quality_score: score, status: "inspected" as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["housekeeping-tasks"] });
      toast.success("Score qualité enregistré");
    },
  });

  const counts = {
    pending: tasks.filter((t: any) => t.status === "pending").length,
    in_progress: tasks.filter((t: any) => t.status === "in_progress").length,
    done: tasks.filter((t: any) => t.status === "done").length,
    inspected: tasks.filter((t: any) => t.status === "inspected").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Housekeeping</h1>
          <p className="text-sm text-muted-foreground">{tasks.length} tâches · suivi en temps réel</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg"><Plus className="mr-2 h-4 w-4" /> Nouvelle tâche</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle tâche ménage</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Chambre *</Label>
                <Select value={form.room_id} onValueChange={(v) => setForm({ ...form, room_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner une chambre" /></SelectTrigger>
                  <SelectContent>
                    {rooms.map((r: any) => (
                      <SelectItem key={r.id} value={r.id}>N° {r.number} — {r.category} (Étage {r.floor})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Assigné à</Label><Input placeholder="Nom de l'agent" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} /></div>
              <div><Label>Notes</Label><Input placeholder="Instructions spéciales..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button onClick={() => createTask.mutate()} disabled={!form.room_id} className="gradient-bg">Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.entries(counts) as [string, number][]).map(([status, count]) => {
          const Icon = STATUS_ICONS[status];
          return (
            <Card key={status} className="glass">
              <CardContent className="flex items-center gap-3 py-4">
                <Icon className="h-5 w-5 text-primary" />
                <div>
                  <div className="text-2xl font-semibold">{count}</div>
                  <div className="text-xs text-muted-foreground">{STATUS_LABELS[status]}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {tasks.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Brush className="mx-auto mb-3 h-10 w-10 text-primary" />
            Aucune tâche de ménage. Créez-en une pour commencer.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((t: any) => (
            <Card key={t.id} className="glass">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Chambre {t.rooms?.number ?? "?"}</CardTitle>
                  <Badge variant="outline" className={STATUS_COLORS[t.status]}>{STATUS_LABELS[t.status]}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {t.rooms?.category} · Étage {t.rooms?.floor} {t.assigned_to ? `· ${t.assigned_to}` : ""}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {t.notes && <p className="text-sm text-muted-foreground">{t.notes}</p>}
                {t.quality_score != null && (
                  <div className="text-sm">Score qualité: <span className="font-semibold gradient-text">{t.quality_score}/100</span></div>
                )}
                <div className="flex items-center gap-2">
                  <Select value={t.status} onValueChange={(v) => updateStatus.mutate({ id: t.id, status: v })}>
                    <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {t.status === "done" && (
                    <Button size="sm" variant="outline" className="text-xs" onClick={() => {
                      const score = prompt("Score qualité (0-100) :");
                      if (score) updateScore.mutate({ id: t.id, score: parseInt(score) });
                    }}>
                      Noter
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
