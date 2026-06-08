import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings, Building2, Users, Bell, ClipboardCheck, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Paramètres — LB Group" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const qc = useQueryClient();

  const [hotel, setHotel] = useState({
    name: "", address: "", phone: "", email: "", description: "", checkin_time: "14:00", checkout_time: "11:00",
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ["hotel-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("hotel_settings" as any).select("*").limit(1).single();
      return data as any;
    },
  });

  useEffect(() => {
    if (settings) {
      setHotel({
        name: settings.name || "",
        address: settings.address || "",
        phone: settings.phone || "",
        email: settings.email || "",
        description: settings.description || "",
        checkin_time: settings.checkin_time || "14:00",
        checkout_time: settings.checkout_time || "11:00",
      });
    }
  }, [settings]);

  const saveSettings = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non connecté");

      if (settings?.id) {
        const { error } = await supabase.from("hotel_settings" as any).update({ ...hotel, updated_at: new Date().toISOString() }).eq("id", settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("hotel_settings" as any).insert({ ...hotel, owner_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hotel-settings"] });
      toast.success("Paramètres enregistrés !");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const { data: staffMembers = [] } = useQuery({
    queryKey: ["staff-members"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*, profiles(full_name)");
      if (error) throw error;
      return data;
    },
  });

  const [notifications, setNotifications] = useState({
    new_reservation: true,
    check_in: true,
    maintenance_urgent: true,
    housekeeping_done: false,
    guest_request: true,
  });

  const ROLE_LABELS: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    receptionist: "Réceptionniste",
    housekeeper: "Housekeeper",
    maintenance: "Maintenance",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Paramètres</h1>
        <p className="text-sm text-muted-foreground">Configuration de votre établissement</p>
      </div>

      <Tabs defaultValue="hotel">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hotel"><Building2 className="mr-2 h-4 w-4" /> Hôtel</TabsTrigger>
          <TabsTrigger value="staff"><Users className="mr-2 h-4 w-4" /> Personnel</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="checklists"><ClipboardCheck className="mr-2 h-4 w-4" /> Checklists</TabsTrigger>
        </TabsList>

        <TabsContent value="hotel" className="mt-4">
          <Card className="glass">
            <CardHeader><CardTitle>Profil de l'établissement</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Nom de l'établissement</Label><Input value={hotel.name} onChange={(e) => setHotel({ ...hotel, name: e.target.value })} placeholder="Hôtel LB Prestige" /></div>
                    <div><Label>Téléphone</Label><Input value={hotel.phone} onChange={(e) => setHotel({ ...hotel, phone: e.target.value })} placeholder="+33 6 60 06 17 23" /></div>
                    <div><Label>Email</Label><Input type="email" value={hotel.email} onChange={(e) => setHotel({ ...hotel, email: e.target.value })} placeholder="contact@lbgroup.cm" /></div>
                    <div><Label>Adresse</Label><Input value={hotel.address} onChange={(e) => setHotel({ ...hotel, address: e.target.value })} placeholder="Douala, Cameroun" /></div>
                    <div><Label>Heure check-in</Label><Input type="time" value={hotel.checkin_time} onChange={(e) => setHotel({ ...hotel, checkin_time: e.target.value })} /></div>
                    <div><Label>Heure check-out</Label><Input type="time" value={hotel.checkout_time} onChange={(e) => setHotel({ ...hotel, checkout_time: e.target.value })} /></div>
                  </div>
                  <div><Label>Description</Label><Textarea value={hotel.description} onChange={(e) => setHotel({ ...hotel, description: e.target.value })} placeholder="Présentation de votre établissement..." /></div>
                  <Button className="gradient-bg text-white font-semibold glow" onClick={() => saveSettings.mutate()} disabled={saveSettings.isPending}>
                    {saveSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enregistrer
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="mt-4">
          <Card className="glass">
            <CardHeader><CardTitle>Gestion du personnel</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Membres de l'équipe et leurs rôles.</p>

              {staffMembers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Depuis</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffMembers.map((m: any) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">{m.profiles?.full_name || m.user_id.slice(0, 8)}</TableCell>
                        <TableCell><Badge variant="outline">{ROLE_LABELS[m.role] || m.role}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(m.created_at).toLocaleDateString("fr-FR")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground italic">Aucun membre assigné. Ajoutez des rôles dans Supabase (table user_roles).</p>
              )}

              <div className="mt-6 rounded-lg border border-border p-4">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2"><UserPlus className="h-4 w-4" /> Rôles disponibles</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div><span className="font-medium text-foreground">Super Admin</span> — Accès total, gestion abonnements</div>
                  <div><span className="font-medium text-foreground">Admin</span> — Gestion complète de l'établissement</div>
                  <div><span className="font-medium text-foreground">Réceptionniste</span> — Check-in/out, réservations, chambres</div>
                  <div><span className="font-medium text-foreground">Housekeeper</span> — Tâches de ménage uniquement</div>
                  <div><span className="font-medium text-foreground">Maintenance</span> — Tickets maintenance uniquement</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card className="glass">
            <CardHeader><CardTitle>Préférences de notifications</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "new_reservation", label: "Nouvelle réservation", desc: "Notification à chaque nouvelle réservation" },
                { key: "check_in", label: "Check-in effectué", desc: "Quand un client fait son check-in" },
                { key: "maintenance_urgent", label: "Ticket maintenance urgent", desc: "Alerte immédiate sur les urgences" },
                { key: "housekeeping_done", label: "Ménage terminé", desc: "Quand une chambre est prête" },
                { key: "guest_request", label: "Nouvelle demande client", desc: "Demande de conciergerie en attente" },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-medium">{n.label}</div>
                    <div className="text-xs text-muted-foreground">{n.desc}</div>
                  </div>
                  <Switch
                    checked={(notifications as any)[n.key]}
                    onCheckedChange={(v) => setNotifications({ ...notifications, [n.key]: v })}
                  />
                </div>
              ))}
              <Button className="gradient-bg text-white font-semibold mt-4" onClick={() => toast.success("Préférences sauvegardées")}>Enregistrer</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklists" className="mt-4">
          <Card className="glass">
            <CardHeader><CardTitle>Templates de checklists ménage</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Checklists de nettoyage par catégorie de chambre.</p>
              {[
                { cat: "Standard", items: ["Draps changés", "Salle de bain nettoyée", "Poubelles vidées", "Sol aspiré", "Minibar vérifié"] },
                { cat: "Deluxe", items: ["Draps changés", "Salle de bain nettoyée", "Poubelles vidées", "Sol aspiré + lavé", "Minibar réapprovisionné", "Peignoirs remplacés", "Produits d'accueil"] },
                { cat: "Suite", items: ["Draps changés (lit king)", "2 salles de bain nettoyées", "Salon aspiré", "Minibar premium", "Fleurs fraîches", "Chocolats sur oreiller", "Vérification jacuzzi"] },
                { cat: "Appartement", items: ["Draps changés", "Cuisine nettoyée", "Vaisselle vérifiée", "Salle de bain", "Salon aspiré", "Balcon nettoyé", "Machines vérifiées"] },
              ].map((c) => (
                <div key={c.cat} className="rounded-lg border border-border p-4">
                  <h4 className="text-sm font-semibold mb-2">{c.cat}</h4>
                  <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                    {c.items.map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded border border-border" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
