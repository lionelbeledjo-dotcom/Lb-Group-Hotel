import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Building2, Users, Bell, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Paramètres — LB Group" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [hotel, setHotel] = useState({
    name: "LB Group Hotel",
    address: "",
    phone: "",
    email: "",
    description: "",
    checkin_time: "14:00",
    checkout_time: "11:00",
  });

  const [notifications, setNotifications] = useState({
    new_reservation: true,
    check_in: true,
    maintenance_urgent: true,
    housekeeping_done: false,
    guest_request: true,
  });

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
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nom</Label><Input value={hotel.name} onChange={(e) => setHotel({ ...hotel, name: e.target.value })} /></div>
                <div><Label>Téléphone</Label><Input value={hotel.phone} onChange={(e) => setHotel({ ...hotel, phone: e.target.value })} /></div>
                <div><Label>Email</Label><Input type="email" value={hotel.email} onChange={(e) => setHotel({ ...hotel, email: e.target.value })} /></div>
                <div><Label>Adresse</Label><Input value={hotel.address} onChange={(e) => setHotel({ ...hotel, address: e.target.value })} /></div>
                <div><Label>Heure check-in</Label><Input type="time" value={hotel.checkin_time} onChange={(e) => setHotel({ ...hotel, checkin_time: e.target.value })} /></div>
                <div><Label>Heure check-out</Label><Input type="time" value={hotel.checkout_time} onChange={(e) => setHotel({ ...hotel, checkout_time: e.target.value })} /></div>
              </div>
              <div><Label>Description</Label><Textarea value={hotel.description} onChange={(e) => setHotel({ ...hotel, description: e.target.value })} placeholder="Présentation de votre établissement..." /></div>
              <Button className="gradient-bg" onClick={() => toast.success("Paramètres sauvegardés")}>Enregistrer</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="mt-4">
          <Card className="glass">
            <CardHeader><CardTitle>Gestion du personnel</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Invitez des membres de votre équipe et attribuez-leur un rôle.</p>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input placeholder="email@exemple.com" /></div>
                <div><Label>Rôle</Label><Input placeholder="receptionist, housekeeper, maintenance..." /></div>
              </div>
              <Button className="gradient-bg" onClick={() => toast.info("Fonctionnalité à venir — invitation par email")}>
                <Users className="mr-2 h-4 w-4" /> Inviter
              </Button>

              <div className="mt-6 space-y-2">
                <h3 className="text-sm font-medium">Rôles disponibles</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div><span className="font-medium text-foreground">Super Admin</span> — Accès total</div>
                  <div><span className="font-medium text-foreground">Admin</span> — Gestion complète</div>
                  <div><span className="font-medium text-foreground">Réceptionniste</span> — Check-in/out, réservations</div>
                  <div><span className="font-medium text-foreground">Housekeeper</span> — Tâches ménage</div>
                  <div><span className="font-medium text-foreground">Maintenance</span> — Tickets maintenance</div>
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
                { key: "new_reservation", label: "Nouvelle réservation" },
                { key: "check_in", label: "Check-in effectué" },
                { key: "maintenance_urgent", label: "Ticket maintenance urgent" },
                { key: "housekeeping_done", label: "Ménage terminé" },
                { key: "guest_request", label: "Nouvelle demande client" },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between">
                  <span className="text-sm">{n.label}</span>
                  <Switch
                    checked={(notifications as any)[n.key]}
                    onCheckedChange={(v) => setNotifications({ ...notifications, [n.key]: v })}
                  />
                </div>
              ))}
              <Button className="gradient-bg mt-4" onClick={() => toast.success("Préférences sauvegardées")}>Enregistrer</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklists" className="mt-4">
          <Card className="glass">
            <CardHeader><CardTitle>Templates de checklists</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Définissez les checklists de nettoyage par catégorie de chambre.</p>
              {["Standard", "Deluxe", "Suite", "Appartement"].map((cat) => (
                <div key={cat} className="rounded-lg border border-border p-3">
                  <h4 className="text-sm font-medium mb-2">{cat}</h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>☐ Draps changés</div>
                    <div>☐ Salle de bain nettoyée</div>
                    <div>☐ Poubelles vidées</div>
                    <div>☐ Minibar vérifié</div>
                    <div>☐ Sol aspiré / lavé</div>
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
