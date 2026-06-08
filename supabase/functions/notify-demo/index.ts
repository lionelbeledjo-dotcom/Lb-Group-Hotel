import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = "lbcloudadmin@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, email, phone, company, rooms, message } = await req.json();

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; background: #f8f9fc; color: #1a2744;">
  <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
    <div style="text-align: center; margin-bottom: 24px; border-bottom: 3px solid #1a2744; padding-bottom: 16px;">
      <h1 style="font-size: 22px; margin: 0;">🔔 Nouvelle demande de démo</h1>
      <p style="color: #666; font-size: 12px; margin-top: 4px;">LB Group — Notification instantanée</p>
    </div>

    <table style="width: 100%; border-collapse: collapse;">
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px 0; font-weight: 600; width: 120px; vertical-align: top;">Nom</td>
        <td style="padding: 10px 0;">${name || "—"}</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px 0; font-weight: 600; vertical-align: top;">Email</td>
        <td style="padding: 10px 0;"><a href="mailto:${email}" style="color: #1a2744;">${email || "—"}</a></td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px 0; font-weight: 600; vertical-align: top;">Téléphone</td>
        <td style="padding: 10px 0;"><a href="tel:${phone}" style="color: #1a2744;">${phone || "—"}</a></td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px 0; font-weight: 600; vertical-align: top;">Établissement</td>
        <td style="padding: 10px 0;">${company || "—"}</td>
      </tr>
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px 0; font-weight: 600; vertical-align: top;">Nb chambres</td>
        <td style="padding: 10px 0;">${rooms || "Non précisé"}</td>
      </tr>
      ${message ? `<tr>
        <td style="padding: 10px 0; font-weight: 600; vertical-align: top;">Message</td>
        <td style="padding: 10px 0;">${message}</td>
      </tr>` : ""}
    </table>

    <div style="margin-top: 24px; text-align: center;">
      <a href="mailto:${email}?subject=Votre démo LB Group" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #1a2744, #2a3f6e); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
        Répondre au prospect
      </a>
    </div>

    <p style="margin-top: 24px; font-size: 11px; color: #999; text-align: center;">
      Reçu le ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })} — LB Group
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
          to: [ADMIN_EMAIL],
          subject: `🔔 Nouvelle démo : ${name} — ${company || "Pas de société"}`,
          html: htmlBody,
          reply_to: email,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("Resend error:", err);
        throw new Error(`Email send failed: ${err}`);
      }
    } else {
      console.log("RESEND_API_KEY not set — email skipped. Demo request:", { name, email, phone, company });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("notify-demo error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
