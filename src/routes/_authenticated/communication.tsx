import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Megaphone, Send, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useRoles } from "@/hooks/use-roles";

export const Route = createFileRoute("/_authenticated/communication")({
  head: () => ({ meta: [{ title: "Communication — LB Group" }] }),
  component: CommunicationPage,
});

function CommunicationPage() {
  const qc = useQueryClient();
  const { isAdmin } = useRoles();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ["internal-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internal_messages" as any)
        .select("*")
        .order("created_at", { ascending: true })
        .limit(100);
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: announcements = [], isLoading: loadingAnnouncements } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as any[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("internal-messages-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "internal_messages" }, () => {
        qc.invalidateQueries({ queryKey: ["internal-messages"] });
      })
      .subscribe();

    const announcementChannel = supabase
      .channel("announcements-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "announcements" }, () => {
        qc.invalidateQueries({ queryKey: ["announcements"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(announcementChannel);
    };
  }, [qc]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");
      const { error } = await supabase.from("internal_messages" as any).insert({
        sender_id: user.id,
        sender_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Staff",
        content: message.trim(),
        type: "message",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setMessage("");
      qc.invalidateQueries({ queryKey: ["internal-messages"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const postAnnouncement = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");
      const { error } = await supabase.from("announcements" as any).insert({
        author_id: user.id,
        author_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Admin",
        title: announcementTitle.trim(),
        body: announcementBody.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setAnnouncementTitle("");
      setAnnouncementBody("");
      qc.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Annonce publiée !");
    },
    onError: (e: any) => toast.error(e.message),
  });

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Communication</h1>
        <p className="text-sm text-muted-foreground">Messagerie interne et annonces</p>
      </div>

      <Tabs defaultValue="messages">
        <TabsList>
          <TabsTrigger value="messages"><MessageSquare className="mr-2 h-4 w-4" /> Messages</TabsTrigger>
          <TabsTrigger value="announcements"><Megaphone className="mr-2 h-4 w-4" /> Annonces</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-4">
          <Card className="glass">
            <CardHeader><CardTitle>Chat d'équipe</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] rounded-lg border border-border p-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Aucun message. Commencez la conversation !</p>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg: any) => (
                      <div key={msg.id} className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-primary">{msg.sender_name}</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(msg.created_at)}</span>
                        </div>
                        <p className="text-sm mt-0.5">{msg.content}</p>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>
                )}
              </ScrollArea>
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => { e.preventDefault(); if (message.trim()) sendMessage.mutate(); }}
              >
                <Input
                  placeholder="Votre message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" className="gradient-bg text-white" disabled={!message.trim() || sendMessage.isPending}>
                  {sendMessage.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="mt-4 space-y-4">
          {isAdmin && (
            <Card className="glass">
              <CardHeader><CardTitle>Nouvelle annonce</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Titre</Label>
                  <Input value={announcementTitle} onChange={(e) => setAnnouncementTitle(e.target.value)} placeholder="Objet de l'annonce" />
                </div>
                <div>
                  <Label>Détails (optionnel)</Label>
                  <Textarea value={announcementBody} onChange={(e) => setAnnouncementBody(e.target.value)} placeholder="Plus de détails..." />
                </div>
                <Button
                  className="gradient-bg text-white font-semibold"
                  disabled={!announcementTitle.trim() || postAnnouncement.isPending}
                  onClick={() => postAnnouncement.mutate()}
                >
                  {postAnnouncement.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Publier l'annonce
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="glass">
            <CardHeader><CardTitle>Annonces récentes</CardTitle></CardHeader>
            <CardContent>
              {loadingAnnouncements ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : announcements.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Aucune annonce pour le moment.</p>
              ) : (
                <div className="space-y-4">
                  {announcements.map((a: any) => (
                    <div key={a.id} className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold">{a.title}</h4>
                        <Badge variant="outline" className="text-[10px]">{formatTime(a.created_at)}</Badge>
                      </div>
                      {a.body && <p className="text-sm text-muted-foreground">{a.body}</p>}
                      <p className="text-xs text-muted-foreground mt-2">— {a.author_name}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
