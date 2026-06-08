import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const APP_URL = Deno.env.get("APP_URL") || "https://lb-zenith-manage.lovable.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, role, token, establishment_name, invited_by_name } = await req.json();

    if (!email || !token) {
      return new Response(JSON.stringify({ error: "email and token required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const joinUrl = `${APP_URL}/join?token=${token}`;

    const ROLE_LABELS: Record<string, string> = {
      admin: "Administrateur",
      receptionist: "Réceptionniste",
      housekeeper: "Housekeeper",
      maintenance: "Maintenance",
    };

    const roleLabel = ROLE_LABELS[role] || role;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: #f8f9fc; color: #1a2744;">
  <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 24px; margin: 0;">LB <span style="color: #c8a45c;">Group</span></h1>
      <p style="color: #666; font-size: 13px; margin-top: 4px;">Gestion Hôtelière Professionnelle</p>
    </div>

    <h2 style="font-size: 18px; margin-bottom: 16px;">Vous êtes invité(e) à rejoindre l'équipe</h2>

    <p style="font-size: 14px; line-height: 1.6; color: #333;">
      <strong>${invited_by_name || "L'administrateur"}</strong> vous invite à rejoindre
      <strong>${establishment_name || "l'établissement"}</strong> en tant que <strong>${roleLabel}</strong>.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${joinUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #1a2744, #2a3f6e); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
        Accepter l'invitation
      </a>
    </div>

    <p style="font-size: 12px; color: #999; text-align: center;">
      Ce lien expire dans 7 jours. Si vous n'avez pas demandé cette invitation, ignorez cet email.
    </p>

    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
    <p style="font-size: 11px; color: #999; text-align: center;">
      LB Group — +33 6 60 06 17 23 — lbcloudadmin@gmail.com
    </p>
  </div>
</body>
</html>`;

    if (RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "LB Group <noreply@lbgroup.cm>",
          to: [email],
          subject: `Invitation à rejoindre ${establishment_name || "LB Group"}`,
          html: htmlBody,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Resend error: ${err}`);
      }
    }

    return new Response(JSON.stringify({ success: true, join_url: joinUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
