import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useWishlist } from "@/lib/wishlist";
import { formatINR } from "@/lib/catalog";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/account")({
  head: () =>
    seoHead({
      title: "My Account — Trayi Jewellery",
      description: "Manage your Trayi profile and view the pieces on your wishlist.",
      path: "/account",
      noindex: true,
    }),
  component: AccountPage,
});

function AccountPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { items, remove } = useWishlist();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setFullName(data?.full_name ?? "");
        setPhone(data?.phone ?? "");
      });
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: fullName, phone });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <section className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <span className="eyebrow">Account</span>
            <h1 className="mt-3 font-display text-4xl">{fullName || user?.email}</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="border border-border px-5 py-2 text-[11px] uppercase tracking-[0.22em] hover:border-foreground"
          >
            Sign out
          </button>
        </div>

        <div className="mt-12 grid gap-12 md:grid-cols-[320px_minmax(0,1fr)]">
          <form onSubmit={save} className="space-y-4">
            <h2 className="font-display text-2xl">Your details</h2>
            <label className="block">
              <span className="eyebrow text-[10px]">Full name</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-2 w-full border-b border-input bg-transparent py-2 text-sm focus:border-accent focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="eyebrow text-[10px]">Phone</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full border-b border-input bg-transparent py-2 text-sm focus:border-accent focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="eyebrow text-[10px]">Email</span>
              <p className="mt-2 border-b border-border py-2 text-sm text-muted-foreground">{user?.email}</p>
            </label>
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-foreground py-3 text-[11px] uppercase tracking-[0.28em] text-background hover:bg-accent transition-colors disabled:opacity-50"
            >
              {busy ? "Saving…" : "Save"}
            </button>
          </form>

          <div>
            <h2 className="font-display text-2xl">Wishlist</h2>
            {items.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Nothing saved yet.{" "}
                <Link to="/collections" className="text-accent underline-offset-4 hover:underline">
                  Browse the collections
                </Link>
              </p>
            ) : (
              <ul className="mt-6 grid gap-6 sm:grid-cols-2">
                {items.map((i) => (
                  <li key={i.id} className="group border border-border/70">
                    <Link to="/product/$productId" params={{ productId: i.product_handle }}>
                      {i.product_image && (
                        <img src={i.product_image} alt={i.product_title ?? "Saved piece"} className="aspect-square w-full object-cover" />
                      )}
                    </Link>
                    <div className="flex items-start justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm">{i.product_title}</p>
                        {i.product_price != null && (
                          <p className="mt-1 text-sm text-muted-foreground">{formatINR(Number(i.product_price))}</p>
                        )}
                      </div>
                      <button
                        onClick={() => remove(i.product_handle)}
                        aria-label="Remove from wishlist"
                        className="text-muted-foreground hover:text-accent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
