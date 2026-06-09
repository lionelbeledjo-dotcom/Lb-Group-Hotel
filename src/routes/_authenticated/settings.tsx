import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Settings, Building2, CreditCard, Bell, Globe, Shield, Mail, Palette,
  Server, Smartphone, Loader2, Check, Save, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Paramètres — LB Group" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  let isSuperAdmin = false;
  try {
    const ctx = useRouteContext({ from: "/_authenticated" }) as any;
    isSuperAdmin = (ctx.roles ?? []).includes("super_admin");
  } catch {}

  if (isSuperAdmin) return <SuperAdminSettings />;
  return <ClientSettings />;
}

function SuperAdminSettings() {
  const [platform, setPlatform] = useState({
    name: "LB Group",
    tagline: "La solution hôtelière nouvelle génération",
    support_email: "lbcloudadmin@gmail.com",
    support_phone: "+33 6 60 06 17 23",
    website: "https://lb-group.lovable.app",
    company_name: "LB Group SAS",
    siret: "",
    address: "Douala, Cameroun",
  });

  const [plans, setPlans] = useState([
    { id: "starter", name: "Starter", price: 29000, rooms: 10, users: 1, modules: 3, active: true },
    { id: "business", name: "Business", price: 79000, rooms: 50, users: 5, modules: -1, active: true },
    { id: "enterprise", name: "Enterprise", price: 149000, rooms: -1, users: -1, modules: -1, active: true },
  ]);

  const [email, setEmail] = useState({
    provider: "resend",
    api_key: "re_J9QdN...CkCr",
    from_name: "LB Group",
    from_email: "onboarding@resend.dev",
    welcome_enabled: true,
    reminder_enabled: true,
    invoice_enabled: true,
  });

  const [payments, setPayments] = useState({
    stripe_enabled: false,
    stripe_key: "",
    mobile_money_enabled: true,
    mobile_money_provider: "cinetpay",
    cinetpay_api_key: "",
    bank_transfer_enabled: true,
    bank_iban: "",
    bank_name: "Ecobank Cameroun",
    trial_days: 14,
    auto_suspend_days: 7,
  });

  const [notifications, setNotifications] = useState({
    new_demo_request: true,
    new_signup: true,
    payment_received: true,
    payment_failed: true,
    subscription_cancelled: true,
    trial_expiring: true,
  });

  const [branding, setBranding] = useState({
    primary_color: "#1a2744",
    accent_color: "#c9a227",
    logo_url: "",
    favicon_url: "",
    custom_domain: "",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Paramètres plateforme</h1>
        <p className="text-sm text-muted-foreground">Configuration globale de LB Group — propriétaire uniquement</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general"><Building2 className="mr-1 h-3.5 w-3.5" /> Général</TabsTrigger>
          <TabsTrigger value="plans"><CreditCard className="mr-1 h-3.5 w-3.5" /> Forfaits</TabsTrigger>
          <TabsTrigger value="payments"><Smartphone className="mr-1 h-3.5 w-3.5" /> Paiements</TabsTrigger>
          <TabsTrigger value="emails"><Mail className="mr-1 h-3.5 w-3.5" /> Emails</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-1 h-3.5 w-3.5" /> Alertes</TabsTrigger>
          <TabsTrigger value="branding"><Palette className="mr-1 h-3.5 w-3.5" /> Branding</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4 space-y-4">
          <Card className="glass">
            <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Informations de la plateforme</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nom de la plateforme</Label><Input value={platform.name} onChange={(e) => setPlatform({ ...platform, name: e.target.value })} /></div>
                <div><Label>Nom de l'entreprise</Label><Input value={platform.company_name} onChange={(e) => setPlatform({ ...platform, company_name: e.target.value })} /></div>
                <div><Label>Email support</Label><Input type="email" value={platform.support_email} onChange={(e) => setPlatform({ ...platform, support_email: e.target.value })} /></div>
                <div><Label>Téléphone support</Label><Input value={platform.support_phone} onChange={(e) => setPlatform({ ...platform, support_phone: e.target.value })} /></div>
                <div><Label>Site web</Label><Input value={platform.website} onChange={(e) => setPlatform({ ...platform, website: e.target.value })} /></div>
                <div><Label>Adresse</Label><Input value={platform.address} onChange={(e) => setPlatform({ ...platform, address: e.target.value })} /></div>
              </div>
              <div><Label>Slogan / Tagline</Label><Input value={platform.tagline} onChange={(e) => setPlatform({ ...platform, tagline: e.target.value })} /></div>
              <Button className="gradient-bg text-white font-semibold" onClick={() => toast.success("Paramètres sauvegardés")}>
                <Save className="mr-2 h-4 w-4" /> Enregistrer
              </Button>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Sécurité & accès</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <div className="text-sm font-medium">Authentification à deux facteurs (2FA)</div>
                  <div className="text-xs text-muted-foreground">Obliger les admins hôtel à activer le 2FA</div>
                </div>
                <Switch defaultChecked={false} />
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <div className="text-sm font-medium">Inscription ouverte</div>
                  <div className="text-xs text-muted-foreground">Permettre aux hôtels de s'inscrire sans invitation</div>
                </div>
                <Switch defaultChecked={true} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium">Mode maintenance</div>
                  <div className="text-xs text-muted-foreground">Bloquer l'accès à tous les clients temporairement</div>
                </div>
                <Switch defaultChecked={false} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="mt-4">
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Configuration des forfaits</CardTitle>
                <Button variant="outline" size="sm">+ Ajouter un forfait</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {plans.map((plan, idx) => (
                <div key={plan.id} className="rounded-xl border border-border p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <Badge variant="outline" className={plan.active ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500"}>
                        {plan.active ? "Actif" : "Désactivé"}
                      </Badge>
                    </div>
                    <Switch checked={plan.active} onCheckedChange={(v) => {
                      const updated = [...plans];
                      updated[idx] = { ...plan, active: v };
                      setPlans(updated);
                    }} />
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Prix mensuel (FCFA)</Label>
                      <Input type="number" value={plan.price} onChange={(e) => {
                        const updated = [...plans];
                        updated[idx] = { ...plan, price: Number(e.target.value) };
                        setPlans(updated);
                      }} />
                    </div>
                    <div>
                      <Label>Max chambres</Label>
                      <Input type="number" value={plan.rooms === -1 ? "" : plan.rooms} placeholder="Illimité" onChange={(e) => {
                        const updated = [...plans];
                        updated[idx] = { ...plan, rooms: e.target.value ? Number(e.target.value) : -1 };
                        setPlans(updated);
                      }} />
                    </div>
                    <div>
                      <Label>Max utilisateurs</Label>
                      <Input type="number" value={plan.users === -1 ? "" : plan.users} placeholder="Illimité" onChange={(e) => {
                        const updated = [...plans];
                        updated[idx] = { ...plan, users: e.target.value ? Number(e.target.value) : -1 };
                        setPlans(updated);
                      }} />
                    </div>
                    <div>
                      <Label>Modules inclus</Label>
                      <Input type="number" value={plan.modules === -1 ? "" : plan.modules} placeholder="Tous" onChange={(e) => {
                        const updated = [...plans];
                        updated[idx] = { ...plan, modules: e.target.value ? Number(e.target.value) : -1 };
                        setPlans(updated);
                      }} />
                    </div>
                  </div>
                </div>
              ))}
              <Button className="gradient-bg text-white font-semibold" onClick={() => toast.success("Forfaits mis à jour")}>
                <Save className="mr-2 h-4 w-4" /> Sauvegarder les forfaits
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4 space-y-4">
          <Card className="glass">
            <CardHeader><CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Méthodes de paiement</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-xl border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center"><CreditCard className="h-5 w-5 text-purple-600" /></div>
                    <div>
                      <div className="font-medium">Stripe (Carte bancaire)</div>
                      <div className="text-xs text-muted-foreground">Visa, Mastercard, American Express</div>
                    </div>
                  </div>
                  <Switch checked={payments.stripe_enabled} onCheckedChange={(v) => setPayments({ ...payments, stripe_enabled: v })} />
                </div>
                {payments.stripe_enabled && (
                  <div><Label>Clé API Stripe (secret)</Label><Input type="password" value={payments.stripe_key} onChange={(e) => setPayments({ ...payments, stripe_key: e.target.value })} placeholder="sk_live_..." /></div>
                )}
              </div>

              <div className="rounded-xl border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center"><Smartphone className="h-5 w-5 text-amber-600" /></div>
                    <div>
                      <div className="font-medium">Mobile Money</div>
                      <div className="text-xs text-muted-foreground">MTN MoMo, Orange Money, via CinetPay</div>
                    </div>
                  </div>
                  <Switch checked={payments.mobile_money_enabled} onCheckedChange={(v) => setPayments({ ...payments, mobile_money_enabled: v })} />
                </div>
                {payments.mobile_money_enabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Fournisseur</Label>
                      <Select value={payments.mobile_money_provider} onValueChange={(v) => setPayments({ ...payments, mobile_money_provider: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cinetpay">CinetPay</SelectItem>
                          <SelectItem value="flutterwave">Flutterwave</SelectItem>
                          <SelectItem value="paystack">Paystack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>Clé API</Label><Input type="password" value={payments.cinetpay_api_key} onChange={(e) => setPayments({ ...payments, cinetpay_api_key: e.target.value })} placeholder="Votre clé API..." /></div>
                  </div>
                )}
              </div>

              <div className="rounded-xl border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><Building2 className="h-5 w-5 text-blue-600" /></div>
                    <div>
                      <div className="font-medium">Virement bancaire</div>
                      <div className="text-xs text-muted-foreground">Paiement manuel, activation sous 48h</div>
                    </div>
                  </div>
                  <Switch checked={payments.bank_transfer_enabled} onCheckedChange={(v) => setPayments({ ...payments, bank_transfer_enabled: v })} />
                </div>
                {payments.bank_transfer_enabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Banque</Label><Input value={payments.bank_name} onChange={(e) => setPayments({ ...payments, bank_name: e.target.value })} /></div>
                    <div><Label>IBAN / RIB</Label><Input value={payments.bank_iban} onChange={(e) => setPayments({ ...payments, bank_iban: e.target.value })} placeholder="CM21..." /></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader><CardTitle>Politique d'essai & suspension</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Durée essai gratuit (jours)</Label>
                  <Input type="number" value={payments.trial_days} onChange={(e) => setPayments({ ...payments, trial_days: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Suspension auto après X jours impayé</Label>
                  <Input type="number" value={payments.auto_suspend_days} onChange={(e) => setPayments({ ...payments, auto_suspend_days: Number(e.target.value) })} />
                </div>
              </div>
              <Button className="gradient-bg text-white font-semibold" onClick={() => toast.success("Configuration paiements sauvegardée")}>
                <Save className="mr-2 h-4 w-4" /> Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails" className="mt-4">
          <Card className="glass">
            <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Configuration emails</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fournisseur email</Label>
                  <Select value={email.provider} onValueChange={(v) => setEmail({ ...email, provider: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resend">Resend</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Clé API</Label><Input type="password" value={email.api_key} onChange={(e) => setEmail({ ...email, api_key: e.target.value })} /></div>
                <div><Label>Nom d'expéditeur</Label><Input value={email.from_name} onChange={(e) => setEmail({ ...email, from_name: e.target.value })} /></div>
                <div><Label>Email d'expédition</Label><Input type="email" value={email.from_email} onChange={(e) => setEmail({ ...email, from_email: e.target.value })} /></div>
              </div>

              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold">Emails automatiques</h3>
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <div className="text-sm font-medium">Email de bienvenue</div>
                    <div className="text-xs text-muted-foreground">Envoyé à chaque nouveau client inscrit</div>
                  </div>
                  <Switch checked={email.welcome_enabled} onCheckedChange={(v) => setEmail({ ...email, welcome_enabled: v })} />
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <div className="text-sm font-medium">Rappels de paiement</div>
                    <div className="text-xs text-muted-foreground">3 jours avant l'échéance + relance si impayé</div>
                  </div>
                  <Switch checked={email.reminder_enabled} onCheckedChange={(v) => setEmail({ ...email, reminder_enabled: v })} />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-medium">Factures automatiques</div>
                    <div className="text-xs text-muted-foreground">Envoi de la facture PDF à chaque paiement</div>
                  </div>
                  <Switch checked={email.invoice_enabled} onCheckedChange={(v) => setEmail({ ...email, invoice_enabled: v })} />
                </div>
              </div>

              <Button className="gradient-bg text-white font-semibold" onClick={() => toast.success("Configuration email sauvegardée")}>
                <Save className="mr-2 h-4 w-4" /> Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card className="glass">
            <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Alertes propriétaire</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Configurez les notifications que vous recevez en tant que propriétaire de la plateforme.</p>
              {[
                { key: "new_demo_request", label: "Nouvelle demande de démo", desc: "Un prospect remplit le formulaire de démo" },
                { key: "new_signup", label: "Nouvel inscrit", desc: "Un hôtel crée son compte sur la plateforme" },
                { key: "payment_received", label: "Paiement reçu", desc: "Un client paie son abonnement" },
                { key: "payment_failed", label: "Échec de paiement", desc: "Un prélèvement a échoué" },
                { key: "subscription_cancelled", label: "Résiliation", desc: "Un client résilie son abonnement" },
                { key: "trial_expiring", label: "Essai qui expire", desc: "Un essai gratuit arrive à échéance (J-3)" },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between py-2 border-b last:border-0">
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
              <Button className="gradient-bg text-white font-semibold mt-4" onClick={() => toast.success("Alertes mises à jour")}>
                <Save className="mr-2 h-4 w-4" /> Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="mt-4">
          <Card className="glass">
            <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Identité visuelle</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Couleur principale</Label>
                  <div className="flex gap-2 items-center mt-1">
                    <input type="color" value={branding.primary_color} onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })} className="h-10 w-10 rounded cursor-pointer" />
                    <Input value={branding.primary_color} onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })} className="flex-1" />
                  </div>
                </div>
                <div>
                  <Label>Couleur d'accent (or)</Label>
                  <div className="flex gap-2 items-center mt-1">
                    <input type="color" value={branding.accent_color} onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })} className="h-10 w-10 rounded cursor-pointer" />
                    <Input value={branding.accent_color} onChange={(e) => setBranding({ ...branding, accent_color: e.target.value })} className="flex-1" />
                  </div>
                </div>
                <div><Label>URL du logo</Label><Input value={branding.logo_url} onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })} placeholder="https://..." /></div>
                <div><Label>URL du favicon</Label><Input value={branding.favicon_url} onChange={(e) => setBranding({ ...branding, favicon_url: e.target.value })} placeholder="https://..." /></div>
              </div>
              <div>
                <Label>Domaine personnalisé</Label>
                <Input value={branding.custom_domain} onChange={(e) => setBranding({ ...branding, custom_domain: e.target.value })} placeholder="app.lbgroup.cm" />
                <p className="text-xs text-muted-foreground mt-1">Configurez un CNAME pointant vers lb-group.lovable.app</p>
              </div>
              <Button className="gradient-bg text-white font-semibold" onClick={() => toast.success("Branding mis à jour")}>
                <Save className="mr-2 h-4 w-4" /> Enregistrer
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ClientSettings() {
  const [hotel, setHotel] = useState({
    name: "", address: "", phone: "", email: "", description: "", checkin_time: "14:00", checkout_time: "11:00",
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hotel"><Building2 className="mr-2 h-4 w-4" /> Mon hôtel</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="account"><Shield className="mr-2 h-4 w-4" /> Compte</TabsTrigger>
        </TabsList>

        <TabsContent value="hotel" className="mt-4">
          <Card className="glass">
            <CardHeader><CardTitle>Profil de l'établissement</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nom</Label><Input value={hotel.name} onChange={(e) => setHotel({ ...hotel, name: e.target.value })} placeholder="Mon Hôtel" /></div>
                <div><Label>Téléphone</Label><Input value={hotel.phone} onChange={(e) => setHotel({ ...hotel, phone: e.target.value })} placeholder="+237..." /></div>
                <div><Label>Email</Label><Input type="email" value={hotel.email} onChange={(e) => setHotel({ ...hotel, email: e.target.value })} /></div>
                <div><Label>Adresse</Label><Input value={hotel.address} onChange={(e) => setHotel({ ...hotel, address: e.target.value })} /></div>
                <div><Label>Check-in</Label><Input type="time" value={hotel.checkin_time} onChange={(e) => setHotel({ ...hotel, checkin_time: e.target.value })} /></div>
                <div><Label>Check-out</Label><Input type="time" value={hotel.checkout_time} onChange={(e) => setHotel({ ...hotel, checkout_time: e.target.value })} /></div>
              </div>
              <div><Label>Description</Label><Textarea value={hotel.description} onChange={(e) => setHotel({ ...hotel, description: e.target.value })} placeholder="..." /></div>
              <Button className="gradient-bg text-white font-semibold" onClick={() => toast.success("Enregistré !")}>
                <Save className="mr-2 h-4 w-4" /> Enregistrer
              </Button>
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
                { key: "guest_request", label: "Demande client", desc: "Demande de conciergerie en attente" },
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
              <Button className="gradient-bg text-white font-semibold" onClick={() => toast.success("Préférences sauvegardées")}>Enregistrer</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="mt-4">
          <Card className="glass">
            <CardHeader><CardTitle>Mon compte</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nom complet</Label><Input placeholder="Votre nom" /></div>
                <div><Label>Email</Label><Input type="email" disabled placeholder="Votre email (non modifiable)" /></div>
              </div>
              <div><Label>Nouveau mot de passe</Label><Input type="password" placeholder="Laisser vide pour ne pas changer" /></div>
              <Button className="gradient-bg text-white font-semibold" onClick={() => toast.success("Compte mis à jour")}>
                <Save className="mr-2 h-4 w-4" /> Mettre à jour
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
