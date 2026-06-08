import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Send, Megaphone, ClipboardList } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/communication")({
  head: () => ({ meta: [{ title: "Communication — LB Group" }] }),
  component: CommunicationPage,
});

function CommunicationPage() {
  const [message, setMessage] = useState("");
  const [announcement, setAnnouncement] = useState({ title: "", body: "" });
  const [handover, setHandover] = useState("");

  const [messages, setMessages] = useState<{ text: string; time: string; from: string }[]>([]);
  const [announcements, setAnnouncements] = useState<{ title: string; body: string; time: string }[]>([]);
  const [handovers, setHandovers] = useState<{ text: string; time: string }[]>([]);

  function sendMessage() {
    if (!message.trim()) return;
    setMessages((prev) => [{ text: message, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), from: "Moi" }, ...prev]);
    setMessage("");
    toast.success("Message envoyé");
  }

  function postAnnouncement() {
    if (!announcement.title.trim()) return;
    setAnnouncements((prev) => [{ ...announcement, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) }, ...prev]);
    setAnnouncement({ title: "", body: "" });
    toast.success("Annonce publiée");
  }

  function addHandover() {
    if (!handover.trim()) return;
    setHandovers((prev) => [{ text: handover, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) }, ...prev]);
    setHandover("");
    toast.success("Note de passation ajoutée");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Communication interne</h1>
        <p className="text-sm text-muted-foreground">Messagerie d'équipe, annonces et passation</p>
      </div>

      <Tabs defaultValue="messages">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="messages"><Users className="mr-2 h-4 w-4" /> Messages</TabsTrigger>
          <TabsTrigger value="announcements"><Megaphone className="mr-2 h-4 w-4" /> Annonces</TabsTrigger>
          <TabsTrigger value="handover"><ClipboardList className="mr-2 h-4 w-4" /> Passation</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4 mt-4">
          <Card className="glass">
            <CardContent className="py-4">
              <div className="flex gap-2">
                <Input placeholder="Écrire un message à l'équipe..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
                <Button className="gradient-bg" onClick={sendMessage}><Send className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
          {messages.length === 0 ? (
            <Card className="glass"><CardContent className="py-10 text-center text-muted-foreground">Aucun message. Commencez la conversation !</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {messages.map((m, i) => (
                <Card key={i} className="glass">
                  <CardContent className="flex items-start gap-3 py-3">
                    <div className="grid h-8 w-8 place-items-center rounded-full gradient-bg text-xs font-bold text-white">{m.from[0]}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{m.from}</span>
                        <span className="text-xs text-muted-foreground">{m.time}</span>
                      </div>
                      <p className="text-sm mt-1">{m.text}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4 mt-4">
          <Card className="glass">
            <CardContent className="py-4 space-y-3">
              <Input placeholder="Titre de l'annonce" value={announcement.title} onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })} />
              <Textarea placeholder="Contenu..." value={announcement.body} onChange={(e) => setAnnouncement({ ...announcement, body: e.target.value })} />
              <Button className="gradient-bg" onClick={postAnnouncement} disabled={!announcement.title.trim()}>
                <Megaphone className="mr-2 h-4 w-4" /> Publier
              </Button>
            </CardContent>
          </Card>
          {announcements.length === 0 ? (
            <Card className="glass"><CardContent className="py-10 text-center text-muted-foreground">Aucune annonce publiée.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {announcements.map((a, i) => (
                <Card key={i} className="glass">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{a.title}</CardTitle>
                      <span className="text-xs text-muted-foreground">{a.time}</span>
                    </div>
                  </CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground">{a.body}</p></CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="handover" className="space-y-4 mt-4">
          <Card className="glass">
            <CardContent className="py-4">
              <div className="flex gap-2">
                <Textarea placeholder="Notes de passation de service..." value={handover} onChange={(e) => setHandover(e.target.value)} className="min-h-[60px]" />
                <Button className="gradient-bg self-end" onClick={addHandover}><ClipboardList className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
          {handovers.length === 0 ? (
            <Card className="glass"><CardContent className="py-10 text-center text-muted-foreground">Aucune note de passation.</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {handovers.map((h, i) => (
                <Card key={i} className="glass">
                  <CardContent className="flex items-start gap-3 py-3">
                    <ClipboardList className="h-5 w-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm">{h.text}</p>
                      <span className="text-xs text-muted-foreground">{h.time}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
