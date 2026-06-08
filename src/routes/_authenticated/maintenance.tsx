import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Plus, Wrench, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance — LB Group" }] }),
  component: MaintenancePage,
});

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  medium: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  urgent: "bg-red-500/20 text-red-300 border-red-500/30",
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  in_progress: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  resolved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Ouvert",
  in_progress: "En cours",
  resolved: "Résolu",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Basse",
  medium: "Moyenne",
  high: "Haute",
  urgent: "Urgente",
};

function MaintenancePage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", room_id: "", priority: "medium", assigned_to: "" });

  const { data: tickets = [] } = useQuery({
    queryKey: ["maintenance-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_tickets")
        .select("*, rooms(number, floor)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("id, number, floor").order("number");
      if (error) throw error;
      return data;
    },
  });

  const createTicket = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("maintenance_tickets").insert({
        title: form.title,
        description: form.description || null,
        room_id: form.room_id || null,
        priority: form.priority as any,
        assigned_to: form.assigned_to || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance-tickets"] });
      toast.success("Ticket créé");
      setOpen(false);
      setForm({ title: "", description: "", room_id: "", priority: "medium", assigned_to: "" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("maintenance_tickets").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["maintenance-tickets"] });
      toast.success("Statut mis à jour");
    },
  });

  const openCount = tickets.filter((t: any) => t.status === "open").length;
  const urgentCount = tickets.filter((t: any) => t.priority === "urgent" && t.status !== "resolved").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Maintenance</h1>
          <p className="text-sm text-muted-foreground">{openCount} tickets ouverts {urgentCount > 0 && `· ${urgentCount} urgent(s)`}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg"><Plus className="mr-2 h-4 w-4" /> Nouveau ticket</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouveau ticket maintenance</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Titre *</Label><Input placeholder="Ex: Climatisation en panne" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea placeholder="Détails du problème..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Chambre</Label>
                  <Select value={form.room_id} onValueChange={(v) => setForm({ ...form, room_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Optionnel" /></SelectTrigger>
                    <SelectContent>
                      {rooms.map((r: any) => (
                        <SelectItem key={r.id} value={r.id}>N° {r.number} (Ét. {r.floor})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priorité</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Assigné à</Label><Input placeholder="Nom du technicien" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button onClick={() => createTicket.mutate()} disabled={!form.title} className="gradient-bg">Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <Clock className="h-5 w-5 text-amber-400" />
            <div><div className="text-2xl font-semibold">{openCount}</div><div className="text-xs text-muted-foreground">Ouverts</div></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <Wrench className="h-5 w-5 text-blue-400" />
            <div><div className="text-2xl font-semibold">{tickets.filter((t: any) => t.status === "in_progress").length}</div><div className="text-xs text-muted-foreground">En cours</div></div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <div><div className="text-2xl font-semibold">{tickets.filter((t: any) => t.status === "resolved").length}</div><div className="text-xs text-muted-foreground">Résolus</div></div>
          </CardContent>
        </Card>
      </div>

      {tickets.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center text-muted-foreground">
            <Wrench className="mx-auto mb-3 h-10 w-10 text-primary" />
            Aucun ticket. Tout fonctionne bien !
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((t: any) => (
            <Card key={t.id} className="glass">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base leading-tight">{t.title}</CardTitle>
                  <Badge variant="outline" className={PRIORITY_COLORS[t.priority]}>{PRIORITY_LABELS[t.priority]}</Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {t.rooms ? `Chambre ${t.rooms.number} · Ét. ${t.rooms.floor}` : "Espace commun"}
                  {t.assigned_to && ` · ${t.assigned_to}`}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {t.description && <p className="text-sm text-muted-foreground line-clamp-2">{t.description}</p>}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={STATUS_COLORS[t.status]}>{STATUS_LABELS[t.status]}</Badge>
                  <Select value={t.status} onValueChange={(v) => updateStatus.mutate({ id: t.id, status: v })}>
                    <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-xs text-muted-foreground">
                  Créé le {new Date(t.created_at).toLocaleDateString("fr-FR")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
