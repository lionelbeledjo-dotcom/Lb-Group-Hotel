import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Inbox, UserPlus, Mail, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/inbox")({
  head: () => ({ meta: [{ title: "Boîte de réception — LB Group" }] }),
  component: InboxPage,
});

function InboxPage() {
  const qc = useQueryClient();

  const { data: demos = [] } = useQuery({
    queryKey: ["demo-requests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("demo_requests" as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ["contact-messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_messages" as any).select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const markDemoAs = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("demo_requests" as any).update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["demo-requests"] });
      toast.success("Statut mis à jour");
    },
  });

  const markContactAs = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("contact_messages" as any).update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contact-messages"] });
      toast.success("Statut mis à jour");
    },
  });

  const newDemos = demos.filter((d) => d.status === "new").length;
  const unreadContacts = contacts.filter((c) => c.status === "unread").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Boîte de réception</h1>
        <p className="text-sm text-muted-foreground">
          {newDemos + unreadContacts > 0 ? `${newDemos + unreadContacts} nouveau(x) message(s)` : "Tout est à jour"}
        </p>
      </div>

      <Tabs defaultValue="demos">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="demos" className="gap-2">
            <UserPlus className="h-4 w-4" /> Demandes de démo {newDemos > 0 && <Badge className="gold-bg text-[oklch(0.15_0.03_250)] ml-1 text-xs">{newDemos}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="contacts" className="gap-2">
            <Mail className="h-4 w-4" /> Messages contact {unreadContacts > 0 && <Badge className="gold-bg text-[oklch(0.15_0.03_250)] ml-1 text-xs">{unreadContacts}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="demos" className="mt-4 space-y-3">
          {demos.length === 0 ? (
            <Card className="glass"><CardContent className="py-12 text-center text-muted-foreground"><UserPlus className="mx-auto h-10 w-10 text-primary mb-3" />Aucune demande de démo.</CardContent></Card>
          ) : demos.map((d) => (
            <Card key={d.id} className="glass">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{d.name}</span>
                      <Badge variant="outline" className={d.status === "new" ? "bg-primary/10 text-primary border-primary/30" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"}>
                        {d.status === "new" ? "Nouveau" : d.status === "contacted" ? "Contacté" : d.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{d.company} · {d.rooms || "?"} chambres</div>
                    <div className="text-sm mt-1">
                      <a href={`mailto:${d.email}`} className="text-[oklch(0.35_0.12_250)] hover:underline">{d.email}</a>
                      {" · "}
                      <a href={`tel:${d.phone}`} className="text-[oklch(0.35_0.12_250)] hover:underline">{d.phone}</a>
                    </div>
                    {d.message && <p className="text-sm text-muted-foreground mt-2 italic">"{d.message}"</p>}
                    <div className="text-xs text-muted-foreground mt-2">{new Date(d.created_at).toLocaleString("fr-FR")}</div>
                  </div>
                  <div className="flex gap-2">
                    {d.status === "new" && (
                      <Button size="sm" className="gradient-bg text-white" onClick={() => markDemoAs.mutate({ id: d.id, status: "contacted" })}>
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Contacté
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="contacts" className="mt-4 space-y-3">
          {contacts.length === 0 ? (
            <Card className="glass"><CardContent className="py-12 text-center text-muted-foreground"><Mail className="mx-auto h-10 w-10 text-primary mb-3" />Aucun message.</CardContent></Card>
          ) : contacts.map((c) => (
            <Card key={c.id} className="glass">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{c.name}</span>
                      <Badge variant="outline" className={c.status === "unread" ? "bg-primary/10 text-primary border-primary/30" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"}>
                        {c.status === "unread" ? "Non lu" : "Lu"}
                      </Badge>
                    </div>
                    <div className="text-sm font-medium">{c.subject}</div>
                    <p className="text-sm text-muted-foreground mt-1">{c.message}</p>
                    <div className="text-sm mt-2">
                      <a href={`mailto:${c.email}`} className="text-[oklch(0.35_0.12_250)] hover:underline">{c.email}</a>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">{new Date(c.created_at).toLocaleString("fr-FR")}</div>
                  </div>
                  <div className="flex gap-2">
                    {c.status === "unread" && (
                      <Button size="sm" variant="outline" onClick={() => markContactAs.mutate({ id: c.id, status: "read" })}>
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Marquer lu
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
