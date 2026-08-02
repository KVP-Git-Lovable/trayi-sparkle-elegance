import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a New Password — Trayi Jewellery" },
      { name: "description", content: "Choose a new password for your Trayi Jewellery account." },
      { property: "og:title", content: "Set a New Password — Trayi Jewellery" },
      { property: "og:description", content: "Choose a new password for your Trayi account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    navigate({ to: "/account", replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="flex-1 flex items-center justify-center px-6 py-20 bg-secondary/30">
        <div className="w-full max-w-md bg-card border border-border p-10">
          <div className="text-center">
            <span className="eyebrow">Account</span>
            <h1 className="mt-3 font-display text-3xl">Set a new password</h1>
          </div>
          {!ready ? (
            <p className="mt-8 text-center text-sm text-muted-foreground">
              Open this page from the recovery link we emailed you to continue.
            </p>
          ) : (
            <form className="mt-8 space-y-4" onSubmit={submit}>
              <label className="block">
                <span className="eyebrow text-[10px]">New password</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full border-b border-input bg-transparent py-2 text-sm focus:border-accent focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="eyebrow text-[10px]">Confirm password</span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="mt-2 w-full border-b border-input bg-transparent py-2 text-sm focus:border-accent focus:outline-none"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="w-full bg-foreground py-3 text-[11px] uppercase tracking-[0.28em] text-background hover:bg-accent transition-colors disabled:opacity-50"
              >
                {busy ? "Updating…" : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
