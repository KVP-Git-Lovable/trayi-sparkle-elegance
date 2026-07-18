import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Trayi Jewellery" },
      { name: "description", content: "Sign in or create your Trayi account to save favourites, track orders and access member events." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="flex-1 flex items-center justify-center px-6 py-20 bg-secondary/30">
        <div className="w-full max-w-md bg-card border border-border p-10">
          <div className="text-center">
            <span className="eyebrow">Welcome</span>
            <h1 className="mt-3 font-display text-3xl">Sign in to Trayi</h1>
            <p className="mt-2 text-sm text-muted-foreground">Save favourites, track orders, access private previews.</p>
          </div>

          <div className="mt-8 space-y-3">
            <button className="w-full flex items-center justify-center gap-3 border border-input py-3 text-sm hover:border-accent hover:text-accent transition-colors">
              <GoogleIcon /> Continue with Google
            </button>
            <button className="w-full flex items-center justify-center gap-3 border border-input py-3 text-sm hover:border-accent hover:text-accent transition-colors">
              <AppleIcon /> Continue with Apple
            </button>
          </div>

          <div className="my-6 flex items-center gap-4 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
            <span className="flex-1 border-t border-border" />or<span className="flex-1 border-t border-border" />
          </div>

          <form className="space-y-4">
            <label className="block">
              <span className="eyebrow text-[10px]">Email</span>
              <input type="email" placeholder="you@example.com"
                className="mt-2 w-full border-b border-input bg-transparent py-2 text-sm focus:border-accent focus:outline-none" />
            </label>
            <label className="block">
              <span className="eyebrow text-[10px]">Password</span>
              <input type="password" placeholder="••••••••"
                className="mt-2 w-full border-b border-input bg-transparent py-2 text-sm focus:border-accent focus:outline-none" />
            </label>
            <button type="button" className="w-full bg-foreground py-3 text-[11px] uppercase tracking-[0.28em] text-background hover:bg-accent transition-colors">
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            New to Trayi? <Link to="/login" className="text-accent">Create an account</Link>
          </p>
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
