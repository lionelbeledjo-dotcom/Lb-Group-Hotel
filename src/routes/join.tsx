import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, XCircle } from "lucide-react";

export const Route = createFileRoute("/join")({
  head: () => ({ meta: [{ title: "Rejoindre — LB Group" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    token: (search.token as string) || "",
  }),
  component: JoinPage,
});

function JoinPage() {
  const { token } = useSearch({ from: "/join" });
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const acceptInvite = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Connectez-vous d'abord pour accepter l'invitation.");

      const { data: invite, error: fetchErr } = await supabase
        .from("staff_invitations" as any)
        .select("*")
        .eq("token", token)
        .eq("status", "pending")
        .single();

      if (fetchErr || !invite) throw new Error("Invitation invalide ou expirée.");

      const inv = invite as any;
      if (new Date(inv.expires_at) < new Date()) throw new Error("Invitation expirée.");

      const { error: roleErr } = await supabase.from("user_roles").insert({
        user_id: user.id,
        role: inv.role,
      });
      if (roleErr && !roleErr.message.includes("duplicate")) throw roleErr;

      const { error: memberErr } = await supabase.from("establishment_members" as any).insert({
        establishment_id: inv.establishment_id,
        user_id: user.id,
        role: inv.role,
      });
      if (memberErr && !memberErr.message.includes("duplicate")) throw memberErr;

      await supabase.from("staff_invitations" as any).update({ status: "accepted" }).eq("id", inv.id);
    },
    onSuccess: () => setStatus("success"),
    onError: (e: any) => {
      setStatus("error");
      setErrorMsg(e.message);
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md glass">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Rejoindre l'équipe</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "idle" && (
            <>
              <p className="text-sm text-muted-foreground">
                Vous avez reçu une invitation à rejoindre un établissement sur LB Group.
              </p>
              {!token ? (
                <p className="text-sm text-red-500">Lien d'invitation invalide (token manquant).</p>
              ) : (
                <Button
                  className="gradient-bg text-white font-semibold w-full"
                  onClick={() => acceptInvite.mutate()}
                  disabled={acceptInvite.isPending}
                >
                  {acceptInvite.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Accepter l'invitation
                </Button>
              )}
            </>
          )}
          {status === "success" && (
            <div className="space-y-3">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
              <p className="text-sm font-medium">Bienvenue dans l'équipe !</p>
              <Button asChild className="gradient-bg text-white w-full">
                <a href="/dashboard">Accéder au dashboard</a>
              </Button>
            </div>
          )}
          {status === "error" && (
            <div className="space-y-3">
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <p className="text-sm text-red-500">{errorMsg}</p>
              <Button variant="outline" onClick={() => setStatus("idle")}>Réessayer</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
