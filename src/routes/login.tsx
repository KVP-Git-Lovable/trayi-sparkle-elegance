import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Trayi Jewellery" },
      { name: "description", content: "Sign in or create your Trayi account to save favourites, track orders and access member events." },
      { property: "og:title", content: "Sign In — Trayi Jewellery" },
      { property: "og:description", content: "Access your Trayi account to save favourites and track orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

type Mode = "signin" | "signup" | "forgot";

function LoginPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<null | "confirm" | "reset">(null);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/account", replace: true });
  }, [user, loading, navigate]);

  const oauth = async (provider: "google" | "apple" | "facebook" | "instagram") => {
    setBusy(true);
    try {
      if (provider === "facebook" || provider === "instagram") {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "facebook",
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;

      } else {
        const result = await lovable.auth.signInWithOAuth(provider, {
          redirect_uri: window.location.origin,
        });
        if (result.error) throw result.error;
        if (result.redirected) {
          setBusy(false);
          return;
        }
      }
      navigate({ to: "/account" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back to Trayi");
        navigate({ to: "/account" });
      } else if (mode === "signup") {
        if (password.length < 6) {
          toast.error("Password must be at least 6 characters.");
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (data.session) {
          navigate({ to: "/account" });
        } else {
          setSent("confirm");
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSent("reset");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const title =
    mode === "signin" ? "Sign in to Trayi" : mode === "signup" ? "Create your account" : "Reset your password";

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="flex-1 flex items-center justify-center px-6 py-20 bg-secondary/30">
        <div className="w-full max-w-md bg-card border border-border p-10">
          <div className="text-center">
            <span className="eyebrow">Welcome</span>
            <h1 className="mt-3 font-display text-3xl">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Save favourites, track orders, access private previews.
            </p>
          </div>

          {sent ? (
            <div className="mt-8 text-center text-sm text-muted-foreground">
              {sent === "confirm" ? (
                <p>
                  We've sent a confirmation link to <span className="text-foreground">{email}</span>. Click it to
                  activate your Trayi account, then sign in.
                </p>
              ) : (
                <p>
                  If an account exists for <span className="text-foreground">{email}</span>, a password reset link is
                  on its way.
                </p>
              )}
              <button
                onClick={() => {
                  setSent(null);
                  setMode("signin");
                }}
                className="mt-6 text-accent text-xs uppercase tracking-[0.22em]"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              {mode !== "forgot" && (
                <>
                  <div className="mt-8 space-y-3">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => oauth("google")}
                      className="w-full flex items-center justify-center gap-3 border border-input py-3 text-sm hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                    >
                      <GoogleIcon /> Continue with Google
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => oauth("apple")}
                      className="w-full flex items-center justify-center gap-3 border border-input py-3 text-sm hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                    >
                      <AppleIcon /> Continue with Apple
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => oauth("facebook")}
                      className="w-full flex items-center justify-center gap-3 border border-input py-3 text-sm hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                    >
                      <FacebookIcon /> Continue with Facebook
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => oauth("instagram")}
                      className="w-full flex items-center justify-center gap-3 border border-input py-3 text-sm hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
                    >
                      <InstagramIcon /> Continue with Instagram
                    </button>
                  </div>

                  <div className="my-6 flex items-center gap-4 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    <span className="flex-1 border-t border-border" />or<span className="flex-1 border-t border-border" />
                  </div>
                </>
              )}

              <form className="space-y-4" onSubmit={submit}>
                {mode === "signup" && (
                  <label className="block">
                    <span className="eyebrow text-[10px]">Full name</span>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Your name"
                      className="mt-2 w-full border-b border-input bg-transparent py-2 text-sm focus:border-accent focus:outline-none"
                    />
                  </label>
                )}
                <label className="block">
                  <span className="eyebrow text-[10px]">Email</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 w-full border-b border-input bg-transparent py-2 text-sm focus:border-accent focus:outline-none"
                  />
                </label>
                {mode !== "forgot" && (
                  <label className="block">
                    <span className="eyebrow text-[10px]">Password</span>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-2 w-full border-b border-input bg-transparent py-2 text-sm focus:border-accent focus:outline-none"
                    />
                  </label>
                )}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full bg-foreground py-3 text-[11px] uppercase tracking-[0.28em] text-background hover:bg-accent transition-colors disabled:opacity-50"
                >
                  {busy
                    ? "Please wait…"
                    : mode === "signin"
                      ? "Sign In"
                      : mode === "signup"
                        ? "Create Account"
                        : "Send Reset Link"}
                </button>
              </form>

              <div className="mt-6 space-y-2 text-center text-xs text-muted-foreground">
                {mode === "signin" && (
                  <>
                    <p>
                      <button onClick={() => setMode("forgot")} className="text-accent">
                        Forgot your password?
                      </button>
                    </p>
                    <p>
                      New to Trayi?{" "}
                      <button onClick={() => setMode("signup")} className="text-accent">
                        Create an account
                      </button>
                    </p>
                  </>
                )}
                {mode !== "signin" && (
                  <p>
                    Already have an account?{" "}
                    <button onClick={() => setMode("signin")} className="text-accent">
                      Sign in
                    </button>
                  </p>
                )}
                <p className="pt-2">
                  <Link to="/contact" className="hover:text-accent">
                    Need help? Contact the boutique
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.6-2.5C16.9 3.5 14.7 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12s4.3 9.5 9.5 9.5c5.5 0 9.1-3.9 9.1-9.3 0-.6-.1-1.1-.2-1.6H12z"/>
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-foreground" aria-hidden>
      <path d="M16.4 12.5c0-2.6 2.1-3.8 2.2-3.9-1.2-1.7-3-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.4 1-4.3 2.6-1.8 3.2-.5 8 1.3 10.6.9 1.3 1.9 2.7 3.3 2.6 1.3-.1 1.8-.9 3.4-.9 1.6 0 2.1.9 3.5.8 1.5 0 2.4-1.3 3.3-2.6.7-1 1.2-2 1.6-3.1-.1 0-3.1-1.2-3.3-4.1zM13.9 4.9c.7-.9 1.2-2.1 1-3.4-1 .1-2.3.7-3 1.6-.7.8-1.3 2-1.1 3.3 1.1.1 2.4-.6 3.1-1.5z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-foreground" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-foreground" aria-hidden>
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.117.63c-.794.297-1.473.648-2.15 1.325-.677.677-1.028 1.356-1.325 2.15-.297.788-.5 1.658-.56 2.936C.015 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.263 2.148.56 2.936.297.792.648 1.472 1.325 2.15.677.677 1.356 1.028 2.15 1.325.788.297 1.659.5 2.936.56 1.28.058 1.687.072 4.947.072s3.667-.015 4.947-.072c1.280-.06 2.136-.263 2.935-.56.792-.297 1.472-.648 2.15-1.325.677-.678 1.028-1.355 1.325-2.15.297-.791.5-1.656.56-2.936.058-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.279-.263-2.148-.56-2.936-.297-.792-.648-1.472-1.325-2.15C21.3 1.27 20.6.923 19.8.63c-.788-.297-1.659-.5-2.936-.56C15.667.015 15.26 0 12 0zm0 2.16c3.203 0 3.585.009 4.849.070 1.171.054 1.805.244 2.227.408.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.354 1.057.408 2.227.061 1.264.07 1.645.07 4.849s-.009 3.585-.07 4.849c-.054 1.171-.244 1.806-.408 2.228-.217.561-.477.96-.896 1.382-.42.419-.819.679-1.381.896-.422.164-1.056.354-2.227.408-1.265.061-1.645.07-4.849.07s-3.585-.009-4.849-.07c-1.171-.054-1.805-.244-2.228-.408-.561-.217-.96-.477-1.382-.896-.419-.42-.679-.819-.896-1.381-.164-.422-.354-1.057-.408-2.227-.061-1.264-.07-1.645-.07-4.849s.009-3.585.07-4.849c.054-1.171.244-1.806.408-2.228.217-.561.477-.96.896-1.382.42-.419.819-.679 1.381-.896.422-.164 1.057-.354 2.228-.408 1.264-.061 1.644-.07 4.849-.07zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
    </svg>
  );
}
