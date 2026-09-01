// Confirms a user's email from a verification-link token created by
// send-verification-email. On success the user can sign in.
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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const { token } = (await req.json()) as { token?: string };
    if (!token || !UUID_RE.test(token)) {
      return json({ error: "Invalid verification link" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: row, error } = await admin
      .from("email_verifications")
      .select("token, user_id, expires_at, used_at")
      .eq("token", token)
      .maybeSingle();

    if (error || !row) {
      return json({ error: "Invalid verification link" }, 400);
    }
    if (row.used_at) {
      // Token already consumed — the account is verified; sign-in works.
      return json({ ok: true, alreadyVerified: true });
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      return json(
        { error: "This verification link has expired. Please sign up again or contact support." },
        410,
      );
    }

    const { error: confirmError } = await admin.auth.admin.updateUserById(
      row.user_id,
      { email_confirm: true },
    );
    if (confirmError) {
      console.error("Failed to confirm user:", confirmError);
      return json({ error: "Could not verify the account" }, 500);
    }

    await admin
      .from("email_verifications")
      .update({ used_at: new Date().toISOString() })
      .eq("token", token);

    return json({ ok: true });
  } catch (error) {
    console.error("verify-email error:", error);
    return json({ error: "Unexpected error" }, 500);
  }
});
