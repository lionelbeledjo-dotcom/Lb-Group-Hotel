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
import { Plus, MessageSquare, Bell } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/requests")({
  head: () => ({ meta: [{ title: "Conciergerie — LB Group" }] }),
  component: RequestsPage,
});

const STATUS_COLORS: Record<string, string> = {
  new: "bg-primary/20 text-primary border-primary/30",
  in_progress: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  done: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  cancelled: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Nouveau",
  in_progress: "En cours",
  done: "Terminé",
  cancelled: "Annulé",
};

const REQUEST_TYPES = [
  "Serviettes supplémentaires",
  "Room service",
  "Taxi / Transport",
  "Information",
  "Réveil",
  "Ménage",
  "Problème technique",
  "Autre",
];

function RequestsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: "", message: "", room_id: "" });

  const { data: requests = [] } = useQuery({
    queryKey: ["guest-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guest_requests")
        .select("*, rooms(number)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("id, number").order("number");
      if (error) throw error;
      return data;
    },
  });

  const createRequest = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("guest_requests").insert({
        type: form.type,
        message: form.message || null,
        room_id: form.room_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["guest-requests"] });
      toast.success("Demande créée");
      setOpen(false);
      setForm({ type: "", message: "", room_id: "" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("guest_requests").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["guest-requests"] });
      toast.success("Statut mis à jour");
    },
  });

  const newCount = requests.filter((r: any) => r.status === "new").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Conciergerie</h1>
          <p className="text-sm text-muted-foreground">
            {newCount > 0 ? `${newCount} nouvelle(s) demande(s)` : "Toutes les demandes traitées"}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg"><Plus className="mr-2 h-4 w-4" /> Nouvelle demande</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle demande client</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Type de demande *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {REQUEST_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Chambre</Label>
                <Select value={form.room_id} onValueChange={(v) => setForm({ ...form, room_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Optionnel" /></SelectTrigger>
                  <SelectContent>
                    {rooms.map((r: any) => (
                      <SelectItem key={r.id} value={r.id}>N° {r.number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Message</Label><Input placeholder="Détails de la demande..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button onClick={() => createRequest.mutate()} disabled={!form.type} className="gradient-bg">Envoyer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {requests.length === 0 ? (
        <Card className="glass">
          <CardContent className="py-16 text-center text-muted-foreground">
            <MessageSquare className="mx-auto mb-3 h-10 w-10 text-primary" />
            Aucune demande pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((r: any) => (
            <Card key={r.id} className="glass">
              <CardContent className="flex items-center gap-4 py-4">
                <div className={`grid h-10 w-10 place-items-center rounded-full ${r.status === "new" ? "gradient-bg" : "bg-muted"}`}>
                  {r.status === "new" ? <Bell className="h-5 w-5 text-white" /> : <MessageSquare className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{r.type}</span>
                    {r.rooms && <span className="text-xs text-muted-foreground">· Chambre {r.rooms.number}</span>}
                  </div>
                  {r.message && <p className="text-sm text-muted-foreground truncate">{r.message}</p>}
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(r.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={STATUS_COLORS[r.status]}>{STATUS_LABELS[r.status]}</Badge>
                  <Select value={r.status} onValueChange={(v) => updateStatus.mutate({ id: r.id, status: v })}>
                    <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
