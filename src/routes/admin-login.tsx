import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Lock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin-login")({
  head: () => ({ meta: [{ title: "Administration — LB Group" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (result.error) return toast.error(result.error.message);
    if (!result.redirected) navigate({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-[oklch(0.2_0.06_250)] via-[oklch(0.25_0.08_250)] to-[oklch(0.3_0.1_250)]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=80')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.2_0.06_250)] via-[oklch(0.2_0.06_250/0.7)] to-transparent" />
        <Link to="/" className="relative flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl gold-bg font-bold text-[oklch(0.15_0.03_250)]">LB</div>
          <span className="text-xl font-bold text-white">LB <span className="gold-text">Group</span></span>
        </Link>
        <div className="relative">
          <ShieldCheck className="h-12 w-12 text-[oklch(0.8_0.16_85)] mb-4" />
          <h2 className="max-w-md text-3xl font-bold leading-tight text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Espace <span className="gold-text">Administration</span>
          </h2>
          <p className="mt-4 max-w-md text-white/70">Accédez au tableau de bord complet de gestion de votre établissement. Réservé aux administrateurs autorisés.</p>
        </div>
        <div className="relative text-xs text-white/50">© 2025 LB Group · Accès restreint</div>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 items-center justify-center p-6 bg-[var(--background)]">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="grid h-9 w-9 place-items-center rounded-xl gradient-bg font-bold text-white text-sm">LB</div>
              <span className="text-lg font-bold">LB <span className="gold-text">Group</span></span>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-[oklch(0.35_0.12_250)]" />
              <h1 className="text-2xl font-bold">Connexion Admin</h1>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">Entrez vos identifiants pour accéder au back-office.</p>

            <form onSubmit={signIn} className="space-y-4">
              <div>
                <Label>Email professionnel</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@lbgroup.cm" className="h-11" />
              </div>
              <div>
                <Label>Mot de passe</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="h-11" />
              </div>
              <div className="text-right">
                <button type="button" onClick={async () => {
                  if (!email) return toast.error("Entrez votre email d'abord");
                  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/dashboard" });
                  if (error) return toast.error(error.message);
                  toast.success("Email de réinitialisation envoyé !");
                }} className="text-xs text-[oklch(0.35_0.12_250)] hover:underline">
                  Mot de passe oublié ?
                </button>
              </div>
              <Button type="submit" className="w-full h-11 gradient-bg text-white font-semibold glow" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Se connecter
              </Button>
            </form>

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
