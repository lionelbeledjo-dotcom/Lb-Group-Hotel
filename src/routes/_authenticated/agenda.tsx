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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/agenda")({
  head: () => ({ meta: [{ title: "Agenda — LB Group" }] }),
  component: AgendaPage,
});

const TYPE_COLORS: Record<string, string> = {
  meeting: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  task: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  event: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  reminder: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
};

function AgendaPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", time: "09:00", type: "task" });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["agenda-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agenda_events" as any)
        .select("*")
        .order("date", { ascending: true });
      if (error) return [];
      return data as any[];
    },
  });

  const addEvent = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");
      const { error } = await supabase.from("agenda_events" as any).insert({
        ...form,
        created_by: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setOpen(false);
      setForm({ title: "", description: "", date: "", time: "09:00", type: "task" });
      qc.invalidateQueries({ queryKey: ["agenda-events"] });
      toast.success("Événement ajouté !");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((e: any) => e.date >= today);
  const past = events.filter((e: any) => e.date < today);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Agenda</h1>
          <p className="text-sm text-muted-foreground">Planning et événements de l'établissement</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-white"><Plus className="mr-2 h-4 w-4" /> Nouveau</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvel événement</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Titre</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Réunion d'équipe" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
                <div><Label>Heure</Label><Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
              </div>
              <div><Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Réunion</SelectItem>
                    <SelectItem value="task">Tâche</SelectItem>
                    <SelectItem value="event">Événement</SelectItem>
                    <SelectItem value="reminder">Rappel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Détails..." /></div>
              <Button className="w-full gradient-bg text-white" onClick={() => addEvent.mutate()} disabled={!form.title || !form.date || addEvent.isPending}>
                {addEvent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <div>
            <h2 className="text-lg font-semibold mb-3">À venir ({upcoming.length})</h2>
            {upcoming.length === 0 ? (
              <Card className="glass"><CardContent className="py-8 text-center text-muted-foreground">Aucun événement à venir</CardContent></Card>
            ) : (
              <div className="space-y-2">
                {upcoming.map((e: any) => (
                  <Card key={e.id} className="glass">
                    <CardContent className="flex items-center gap-4 py-3">
                      <div className="text-center min-w-[50px]">
                        <div className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString("fr-FR", { month: "short" })}</div>
                        <div className="text-xl font-bold">{new Date(e.date).getDate()}</div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{e.title}</span>
                          <Badge variant="outline" className={TYPE_COLORS[e.type] || ""}>{e.type}</Badge>
                        </div>
                        {e.description && <p className="text-xs text-muted-foreground mt-1">{e.description}</p>}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />{e.time}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {past.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3 text-muted-foreground">Passés ({past.length})</h2>
              <div className="space-y-2 opacity-60">
                {past.slice(0, 5).map((e: any) => (
                  <Card key={e.id} className="glass">
                    <CardContent className="flex items-center gap-4 py-3">
                      <div className="text-center min-w-[50px]">
                        <div className="text-xs text-muted-foreground">{new Date(e.date).toLocaleDateString("fr-FR", { month: "short" })}</div>
                        <div className="text-xl font-bold">{new Date(e.date).getDate()}</div>
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-sm">{e.title}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
