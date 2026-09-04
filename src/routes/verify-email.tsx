import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";
import { seoHead } from "@/lib/seo";

type VerifySearch = { token?: string };

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>): VerifySearch => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  head: () =>
    seoHead({
      title: "Verify Your Email — Trayi Jewellery",
      description: "Confirm your email to activate your Trayi Jewellery account.",
      path: "/verify-email",
      noindex: true,
    }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token } = Route.useSearch();
  const [state, setState] = useState<"verifying" | "success" | "error">(
    "verifying",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("This verification link is invalid or incomplete.");
      return;
    }
    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase.functions.invoke("verify-email", {
        body: { token },
      });
      if (cancelled) return;
      if (error || data?.error) {
        setState("error");
        setMessage(
          data?.error ||
            "We could not verify this link. It may have expired — please sign up again or contact support@trayi.com.",
        );
      } else {
        setState("success");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-24">
        <div className="w-full max-w-lg border border-border/70 bg-card px-8 py-14 text-center">
          <span className="eyebrow">Account</span>
          {state === "verifying" && (
            <>
              <h1 className="mt-4 font-serif text-3xl">Verifying your email…</h1>
              <p className="mt-4 text-sm text-muted-foreground">
                One moment while we activate your Trayi account.
              </p>
            </>
          )}
          {state === "success" && (
            <>
              <h1 className="mt-4 font-serif text-3xl">Email confirmed</h1>
              <p className="mt-4 text-sm text-muted-foreground">
                Your Trayi account is now active. Sign in to start exploring
                our collections.
              </p>
              <div className="mt-8">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center bg-primary px-8 py-3 text-[12px] uppercase tracking-[0.22em] text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Sign in
                </Link>
              </div>
            </>
          )}
          {state === "error" && (
            <>
              <h1 className="mt-4 font-serif text-3xl">
                Verification unsuccessful
              </h1>
              <p className="mt-4 text-sm text-muted-foreground">{message}</p>
              <div className="mt-8">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center border border-border px-8 py-3 text-[12px] uppercase tracking-[0.22em] text-foreground transition-colors hover:bg-accent/10"
                >
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
