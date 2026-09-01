import { Link } from "@tanstack/react-router";
import { User, ShoppingBag, Menu } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { SearchDialog } from "./search-dialog";
import headerLogo from "@/assets/trayi-header-logo.png";

const nav: Array<{ to: string; params?: Record<string, string>; label: string }> = [
  { to: "/collections", label: "Collections" },
  { to: "/education", label: "Lab-Grown Diamonds" },
  { to: "/about", label: "Our Story" },
  { to: "/contact", label: "Visit Us" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <button
          className="md:hidden -ml-2 p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden md:flex flex-1 items-center gap-6 text-[13px] tracking-wide text-foreground/80">
          <SearchDialog />
        </div>

        <Link to="/" className="flex items-center gap-3 leading-none">
          <img src={headerLogo} alt="TRAYI" className="h-12 w-auto" style={{ mixBlendMode: 'multiply' }} />
          <span
            className="font-wordmark text-4xl md:text-5xl tracking-[0.045em] text-foreground/60 translate-y-[0.10em]"
            style={{ WebkitTextStroke: "0.6px var(--background)" }}
          >
            TRAYI
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-4 text-foreground/80">
          {user ? (
            <Link to="/account" aria-label="My account" title="My account" className="hover:text-accent transition-colors">
              <User className="h-5 w-5 text-accent" />
            </Link>
          ) : (
            <Link to="/login" aria-label="Sign in" title="Sign in" className="hover:text-accent transition-colors">
              <User className="h-5 w-5" />
            </Link>
          )}
          <Link to="/cart" aria-label="Cart" className="relative hover:text-accent transition-colors">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-accent-foreground">
              {count}
            </span>
          </Link>
        </div>
      </div>

      <nav className="hidden md:block border-t border-border/60">
        <ul className="mx-auto flex max-w-7xl items-center justify-center gap-10 px-6 py-3 text-[12px] font-medium uppercase tracking-[0.22em] text-foreground/70">
          {nav.map((n) => (
            <li key={n.label}>
              <Link
                to={n.to}
                params={n.params as never}
                activeProps={{ className: "text-accent" }}
                className="hover:text-accent transition-colors"
              >
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {open && (
        <nav className="md:hidden border-t border-border/60 bg-background">
          <ul className="flex flex-col px-6 py-4 text-sm">
            {nav.map((n) => (
              <li key={n.label}>
                <Link
                  to={n.to}
                  params={n.params as never}
                  onClick={() => setOpen(false)}
                  className="block py-3 border-b border-border/40 uppercase tracking-[0.2em] text-[12px]"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
