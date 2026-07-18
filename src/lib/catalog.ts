import ringImg from "@/assets/cat-rings.jpg";
import earringImg from "@/assets/cat-earrings.jpg";
import pendantImg from "@/assets/cat-pendants.jpg";
import braceletImg from "@/assets/cat-bracelets.jpg";
import bridalImg from "@/assets/cat-bridal.jpg";

export type Category = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
};

export const categories: Category[] = [
  { slug: "rings", name: "Rings", tagline: "Solitaires, bands & statement rings", image: ringImg },
  { slug: "earrings", name: "Earrings", tagline: "Studs, drops & chandeliers", image: earringImg },
  { slug: "pendants", name: "Pendants", tagline: "Everyday brilliance", image: pendantImg },
  { slug: "bracelets", name: "Bracelets", tagline: "Tennis & delicate lines", image: braceletImg },
  { slug: "bridal", name: "Bridal", tagline: "Heirlooms for your forever", image: bridalImg },
];

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  carats: string;
  metal: string;
  image: string;
};

export const products: Product[] = [
  { id: "sol-01", name: "Aria Solitaire Ring", category: "rings", price: 84500, carats: "0.50 ct", metal: "18k Rose Gold", image: ringImg },
  { id: "drop-01", name: "Elyse Pear Drops", category: "earrings", price: 62000, carats: "1.20 ct total", metal: "18k Rose Gold", image: earringImg },
  { id: "pen-01", name: "Luna Solitaire Pendant", category: "pendants", price: 38900, carats: "0.30 ct", metal: "18k Rose Gold", image: pendantImg },
  { id: "brc-01", name: "Seren Tennis Bracelet", category: "bracelets", price: 145000, carats: "2.50 ct total", metal: "18k Rose Gold", image: braceletImg },
  { id: "brd-01", name: "Maharani Bridal Set", category: "bridal", price: 425000, carats: "5.80 ct total", metal: "18k White Gold", image: bridalImg },
  { id: "sol-02", name: "Ivy Halo Ring", category: "rings", price: 96000, carats: "0.70 ct", metal: "18k White Gold", image: ringImg },
  { id: "drop-02", name: "Mira Diamond Studs", category: "earrings", price: 42500, carats: "0.50 ct total", metal: "18k Rose Gold", image: earringImg },
  { id: "pen-02", name: "Nova Halo Pendant", category: "pendants", price: 54000, carats: "0.45 ct", metal: "18k White Gold", image: pendantImg },
];

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
