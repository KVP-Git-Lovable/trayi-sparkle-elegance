import { Link } from "@tanstack/react-router";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";
import logoSvg from "@/assets/trayi-logo.svg";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-4">
        <div>
          <img src={logoSvg} alt="TRAYI" className="h-16 w-auto mb-2" />
          <p className="eyebrow mt-2 text-[10px]">Lab-Grown Diamonds</p>
          <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
            Mangalore's exclusive destination for LimeLight lab-grown diamond
            jewellery. Certified. Ethical. Forever.
          </p>
        </div>

        <div>
          <h4 className="eyebrow mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/collections" className="hover:text-accent">All Collections</Link></li>
            <li><Link to="/collections/bridal" className="hover:text-accent">Bridal</Link></li>
            <li><Link to="/education" className="hover:text-accent">Lab-Grown Diamonds 101</Link></li>
            <li><Link to="/about" className="hover:text-accent">Our Story</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow mb-4">Assistance</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/contact" className="hover:text-accent">Book an Appointment</Link></li>
            <li><Link to="/education" className="hover:text-accent">Certification & Care</Link></li>
            <li><Link to="/contact" className="hover:text-accent">Shipping & Returns</Link></li>
            <li><Link to="/contact" className="hover:text-accent">Contact Us</Link></li>
            <li><Link to="/terms-and-conditions" className="hover:text-accent">Terms & Conditions</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow mb-4">Visit</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 text-accent" /> <div>2nd Floor, Bharath Mall, Near Jayalakshmi Silks, Bejai, Mangalore</div></li>
            <li className="flex gap-2"><Phone className="h-4 w-4 mt-0.5 text-accent" /> +91 · 8971783030</li>
            <li className="flex gap-2"><Mail className="h-4 w-4 mt-0.5 text-accent" /> sales.trayi@gmail.com</li>
            <li>
              <a
                href="https://www.instagram.com/trayijewellers/"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-accent"
              >
                <Instagram className="h-4 w-4" /> @trayijewellers
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Trayi Jewellery · Exclusive LimeLight Retailer · Mangalore
      </div>
    </footer>
  );
}
