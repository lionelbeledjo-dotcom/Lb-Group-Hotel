import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Phone, Mail, MapPin, Send } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — LB Group" }] }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    toast.success("Message envoyé ! Nous vous répondrons sous 24h.");
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-border bg-white/80 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-bg font-bold text-white text-sm">LB</div>
            <span className="text-xl font-bold">LB <span className="gold-text">Group</span></span>
          </Link>
          <Link to="/"><Button variant="ghost"><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button></Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 max-w-5xl">
        <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Contactez-<span className="gold-text">nous</span></h1>
        <p className="text-lg text-muted-foreground mb-12">Une question ? Un besoin spécifique ? Notre équipe est à votre écoute.</p>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6">
            {[
              { icon: Phone, label: "Téléphone", value: "+33 6 60 06 17 23", href: "tel:+33660061723" },
              { icon: Mail, label: "Email", value: "lbcloudadmin@gmail.com", href: "mailto:lbcloudadmin@gmail.com" },
              { icon: MapPin, label: "Localisation", value: "France / Cameroun", href: undefined },
            ].map((item) => (
              <Card key={item.label} className="glass">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-[oklch(0.35_0.12_250/0.1)]">
                    <item.icon className="h-5 w-5 text-[oklch(0.35_0.12_250)]" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} className="font-medium hover:text-[oklch(0.35_0.12_250)] transition-colors">{item.value}</a>
                    ) : (
                      <div className="font-medium">{item.value}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="lg:col-span-2 shadow-lg border-0">
            <CardContent className="p-8">
              {sent ? (
                <div className="text-center py-10">
                  <Send className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Message envoyé !</h3>
                  <p className="text-muted-foreground">Nous vous répondrons dans les plus brefs délais.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Nom</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Votre nom" /></div>
                    <div><Label>Email</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="votre@email.com" /></div>
                  </div>
                  <div><Label>Sujet</Label><Input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Objet de votre message" /></div>
                  <div><Label>Message</Label><Textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Votre message..." className="min-h-[120px]" /></div>
                  <Button type="submit" className="w-full gradient-bg text-white font-semibold glow">
                    <Send className="mr-2 h-4 w-4" /> Envoyer
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
