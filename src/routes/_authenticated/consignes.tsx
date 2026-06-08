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
import { ScrollText, Plus, Loader2, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/consignes")({
  head: () => ({ meta: [{ title: "Consignes — LB Group" }] }),
  component: ConsignesPage,
});

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-500/10 text-red-600 border-red-500/30",
  important: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  normal: "bg-blue-500/10 text-blue-600 border-blue-500/30",
};

const PRIORITY_ICONS: Record<string, any> = {
  urgent: AlertTriangle,
  important: Info,
  normal: CheckCircle,
};

function ConsignesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", priority: "normal", target_role: "all" });

  const { data: consignes = [], isLoading } = useQuery({
    queryKey: ["consignes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consignes" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) return [];
      return data as any[];
    },
  });

  const addConsigne = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");
      const { error } = await supabase.from("consignes" as any).insert({
        ...form,
        author_id: user.id,
        author_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setOpen(false);
      setForm({ title: "", body: "", priority: "normal", target_role: "all" });
      qc.invalidateQueries({ queryKey: ["consignes"] });
      toast.success("Consigne ajoutée !");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const markDone = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("consignes" as any).update({ status: "done" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["consignes"] });
      toast.success("Consigne résolue");
    },
  });

  const active = consignes.filter((c: any) => c.status !== "done");
  const done = consignes.filter((c: any) => c.status === "done");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Consignes</h1>
          <p className="text-sm text-muted-foreground">Instructions et directives pour l'équipe</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-bg text-white"><Plus className="mr-2 h-4 w-4" /> Nouvelle consigne</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nouvelle consigne</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Titre</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Fermer le bar à 23h" /></div>
              <div><Label>Détails</Label><Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Instructions détaillées..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Priorité</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="important">Important</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Pour</Label>
                  <Select value={form.target_role} onValueChange={(v) => setForm({ ...form, target_role: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tout le monde</SelectItem>
                      <SelectItem value="receptionist">Réception</SelectItem>
                      <SelectItem value="housekeeper">Ménage</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full gradient-bg text-white" onClick={() => addConsigne.mutate()} disabled={!form.title || addConsigne.isPending}>
                {addConsigne.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Publier
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : active.length === 0 ? (
        <Card className="glass"><CardContent className="py-12 text-center text-muted-foreground"><ScrollText className="mx-auto mb-3 h-10 w-10" />Aucune consigne active</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {active.map((c: any) => {
            const Icon = PRIORITY_ICONS[c.priority] || Info;
            return (
              <Card key={c.id} className="glass">
                <CardContent className="flex items-start gap-4 py-4">
                  <Icon className={`h-5 w-5 mt-0.5 ${c.priority === "urgent" ? "text-red-500" : c.priority === "important" ? "text-amber-500" : "text-blue-500"}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{c.title}</span>
                      <Badge variant="outline" className={PRIORITY_COLORS[c.priority]}>{c.priority}</Badge>
                      {c.target_role !== "all" && <Badge variant="secondary" className="text-[10px]">{c.target_role}</Badge>}
                    </div>
                    {c.body && <p className="text-xs text-muted-foreground">{c.body}</p>}
                    <p className="text-[10px] text-muted-foreground mt-2">Par {c.author_name} — {new Date(c.created_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => markDone.mutate(c.id)}>Fait</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {done.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Résolues ({done.length})</h2>
          <div className="space-y-1 opacity-50">
            {done.slice(0, 5).map((c: any) => (
              <Card key={c.id} className="glass"><CardContent className="py-2 flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /><span className="text-sm line-through">{c.title}</span></CardContent></Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
