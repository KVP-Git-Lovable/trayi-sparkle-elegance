// Sends the account-verification email through the Resend API.
// Called by the website right after sign-up. Secrets used:
//   RESEND_API_KEY  - Resend API key (send-only is sufficient)
//   RESEND_FROM     - sender, e.g. "Trayi Jewellery <onboarding@resend.dev>"
//   SITE_URL        - public site origin used to build the verification link
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const { userId, email } = (await req.json()) as {
      userId?: string;
      email?: string;
    };
    if (!userId || !email) {
      return json({ error: "userId and email are required" }, 400);
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.error("RESEND_API_KEY is not configured");
      return json({ error: "Email service not configured" }, 503);
    }
    const from =
      Deno.env.get("RESEND_FROM") ||
      "Trayi Jewellery <onboarding@resend.dev>";
    const siteUrl = (
      Deno.env.get("SITE_URL") || "https://trayi-sparkle-elegance.lovable.app"
    ).replace(/\/$/, "");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // The user must exist, match the email, and still be unconfirmed.
    const { data: userData, error: userError } =
      await admin.auth.admin.getUserById(userId);
    if (userError || !userData?.user) {
      return json({ error: "User not found" }, 404);
    }
    const user = userData.user;
    if ((user.email || "").toLowerCase() !== email.toLowerCase()) {
      return json({ error: "Email does not match" }, 400);
    }
    if (user.email_confirmed_at) {
      return json({ ok: true, alreadyConfirmed: true });
    }

    const { data: tokenRow, error: tokenError } = await admin
      .from("email_verifications")
      .insert({ user_id: user.id, email: user.email })
      .select("token")
      .single();
    if (tokenError || !tokenRow) {
      console.error("Failed to create verification token:", tokenError);
      return json({ error: "Could not create verification token" }, 500);
    }

    const verifyUrl = `${siteUrl}/verify-email?token=${tokenRow.token}`;
    const html = `
      <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1c1917;">
        <h1 style="font-weight: 500; font-size: 24px; letter-spacing: 0.02em;">Welcome to Trayi Jewellery</h1>
        <p style="font-size: 15px; line-height: 1.6; color: #44403c;">
          Thank you for creating your Trayi account. Please confirm your email
          address to activate your account.
        </p>
        <p style="margin: 28px 0;">
          <a href="${verifyUrl}"
             style="background: #1c1917; color: #fafaf9; text-decoration: none; padding: 14px 28px; font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase;">
            Confirm my email
          </a>
        </p>
        <p style="font-size: 13px; line-height: 1.6; color: #78716c;">
          Or copy this link into your browser:<br/>
          <a href="${verifyUrl}" style="color: #a8826d;">${verifyUrl}</a>
        </p>
        <p style="font-size: 12px; color: #a8a29e;">
          This link expires in 24 hours. If you did not create this account,
          you can safely ignore this email.
        </p>
      </div>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [user.email],
        subject: "Confirm your Trayi Jewellery account",
        html,
      }),
    });

    if (!resendRes.ok) {
      const detail = await resendRes.text().catch(() => "");
      console.error(`Resend error ${resendRes.status}: ${detail}`);
      return json({ error: "Could not send verification email" }, 502);
    }

    return json({ ok: true });
  } catch (error) {
    console.error("send-verification-email error:", error);
    return json({ error: "Unexpected error" }, 500);
  }
});
