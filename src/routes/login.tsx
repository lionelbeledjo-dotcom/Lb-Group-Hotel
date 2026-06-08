import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Connexion — LB Group" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    navigate({ to: "/dashboard" });
  }

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin + "/dashboard", data: { full_name: fullName, phone } },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Compte créé ! Vérifiez votre email pour confirmer.");
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/dashboard",
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Email de réinitialisation envoyé ! Vérifiez votre boîte de réception.");
    setResetMode(false);
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (result.error) return toast.error(result.error.message);
    if (!result.redirected) navigate({ to: "/dashboard" });
  }

  if (resetMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-6">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8">
            <button onClick={() => setResetMode(false)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Retour à la connexion
            </button>
            <h1 className="text-2xl font-bold mb-2">Mot de passe oublié</h1>
            <p className="text-sm text-muted-foreground mb-6">Entrez votre email, nous vous enverrons un lien de réinitialisation.</p>
            <form onSubmit={resetPassword} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="votre@email.com" className="h-11" />
              </div>
              <Button type="submit" className="w-full h-11 gradient-bg text-white font-semibold" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Envoyer le lien
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-[oklch(0.2_0.06_250)] via-[oklch(0.25_0.08_250)] to-[oklch(0.3_0.1_250)]">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.2_0.06_250)] via-[oklch(0.2_0.06_250/0.6)] to-transparent" />
        <Link to="/" className="relative flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl gold-bg font-bold text-[oklch(0.15_0.03_250)]">LB</div>
          <span className="text-xl font-bold text-white">LB <span className="gold-text">Group</span></span>
        </Link>
        <div className="relative">
          <h2 className="max-w-md text-3xl font-bold leading-tight text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Gérez votre établissement <span className="gold-text">simplement</span>
          </h2>
          <p className="mt-4 max-w-md text-white/70">Accédez à tous vos modules : réservations, réception, housekeeping, maintenance, finance et plus encore.</p>
          <div className="mt-8 space-y-3">
            {["Interface intuitive et moderne", "Données en temps réel", "Accessible sur tous vos appareils"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-white/80 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-[oklch(0.8_0.16_85)]" />
                {t}
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-white/50">© 2025 LB Group</div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center p-6 bg-[var(--background)]">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <Link to="/" className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl gradient-bg font-bold text-white text-sm">LB</div>
                <span className="text-lg font-bold">LB <span className="gold-text">Group</span></span>
              </Link>
            </div>

            <h1 className="text-2xl font-bold mb-1">Bienvenue</h1>
            <p className="mb-6 text-sm text-muted-foreground">Connectez-vous ou créez votre compte LB Group</p>

            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="mt-4">
                <form onSubmit={signIn} className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="votre@email.com" className="h-11" />
                  </div>
                  <div>
                    <Label>Mot de passe</Label>
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="h-11" />
                  </div>
                  <div className="text-right">
                    <button type="button" onClick={() => setResetMode(true)} className="text-xs text-[oklch(0.35_0.12_250)] hover:underline">
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <Button type="submit" className="w-full h-11 gradient-bg text-white font-semibold glow" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Se connecter
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-4">
                <form onSubmit={signUp} className="space-y-4">
                  <div>
                    <Label>Nom complet</Label>
                    <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Jean Dupont" className="h-11" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="votre@email.com" className="h-11" />
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33 6 XX XX XX XX" className="h-11" />
                  </div>
                  <div>
                    <Label>Mot de passe</Label>
                    <Input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Minimum 6 caractères" className="h-11" />
                  </div>
                  <Button type="submit" className="w-full h-11 gradient-bg text-white font-semibold glow" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Créer mon compte
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" /> OU <div className="h-px flex-1 bg-border" />
            </div>

            <Button variant="outline" className="w-full h-11" onClick={google}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.3 12 2.3 6.5 2.3 2.1 6.8 2.1 12.3S6.5 22.3 12 22.3c6.9 0 9.5-4.8 9.5-9.3 0-.6-.1-1.1-.2-1.6H12z"/></svg>
              Continuer avec Google
            </Button>

            <p className="mt-6 text-xs text-center text-muted-foreground">
              <Link to="/" className="text-[oklch(0.35_0.12_250)] hover:underline">← Retour au site</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
