import ringImg from "@/assets/cat-rings.jpg";
import earringImg from "@/assets/cat-earrings.jpg";
import pendantImg from "@/assets/cat-pendants.jpg";
import braceletImg from "@/assets/cat-bracelets.jpg";
import bridalImg from "@/assets/cat-bridal.jpg";
import heroImg from "@/assets/hero-main.jpg";
import bannerImg from "@/assets/collection-banner.jpg";
import educationImg from "@/assets/education-lab.jpg";

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
  mrp?: number;
  carats: string;
  metal: string;
  metalOptions: string[];
  purityOptions: string[]; // 9KT, 14KT, 18KT
  sizes?: string[];        // ring sizes / bracelet lengths
  sizeLabel?: string;      // e.g. "Ring Size" / "Length"
  image: string;
  gallery: string[];
  description: string;
  sku: string;
  weightGm: number;
  diamondCt: number;
};

const gallery = (main: string) => [main, ringImg, earringImg, pendantImg, braceletImg];

export const products: Product[] = [
  {
    id: "sol-01", sku: "TR-RNG-001", name: "Aria Solitaire Ring", category: "rings",
    price: 84500, mrp: 94730, carats: "0.50 ct", metal: "18k Rose Gold",
    metalOptions: ["Rose Gold", "Yellow Gold", "White Gold"],
    purityOptions: ["14 KT", "18 KT"],
    sizes: ["10", "11", "12", "13", "14", "15", "16"],
    sizeLabel: "Ring Size",
    image: ringImg, gallery: gallery(ringImg),
    description: "A single, precisely cut 0.50ct lab-grown diamond held in a whisper-thin four-prong setting. Understated, luminous, everyday-forever.",
    weightGm: 2.85, diamondCt: 0.5,
  },
  {
    id: "sol-02", sku: "TR-RNG-002", name: "Ivy Halo Ring", category: "rings",
    price: 96000, mrp: 108500, carats: "0.70 ct", metal: "18k White Gold",
    metalOptions: ["White Gold", "Rose Gold", "Yellow Gold"],
    purityOptions: ["14 KT", "18 KT"],
    sizes: ["10", "11", "12", "13", "14", "15", "16"],
    sizeLabel: "Ring Size",
    image: ringImg, gallery: gallery(ringImg),
    description: "A radiant centre stone framed by a delicate halo of pavé-set lab-grown diamonds — for a look that is bigger than its carats.",
    weightGm: 3.42, diamondCt: 0.98,
  },
  {
    id: "sol-03", sku: "TR-RNG-003", name: "Celeste Band", category: "rings",
    price: 58900, carats: "0.35 ct total", metal: "18k Yellow Gold",
    metalOptions: ["Yellow Gold", "Rose Gold", "White Gold"],
    purityOptions: ["14 KT", "18 KT"],
    sizes: ["10", "11", "12", "13", "14", "15", "16"],
    sizeLabel: "Ring Size",
    image: ringImg, gallery: gallery(ringImg),
    description: "A slim eternity band lined with brilliant round diamonds — the wedding band, reimagined for every day.",
    weightGm: 2.10, diamondCt: 0.35,
  },
  {
    id: "sol-04", sku: "TR-RNG-004", name: "Fleur Trinity Ring", category: "rings",
    price: 112000, mrp: 128900, carats: "0.85 ct total", metal: "18k Rose Gold",
    metalOptions: ["Rose Gold", "White Gold"],
    purityOptions: ["14 KT", "18 KT"],
    sizes: ["10", "11", "12", "13", "14", "15"],
    sizeLabel: "Ring Size",
    image: ringImg, gallery: gallery(ringImg),
    description: "Three brilliant lab-grown diamonds — past, present, forever — set in a scalloped rose gold cradle.",
    weightGm: 3.90, diamondCt: 0.85,
  },
  {
    id: "drop-01", sku: "TR-EAR-001", name: "Elyse Pear Drops", category: "earrings",
    price: 62000, mrp: 71200, carats: "1.20 ct total", metal: "18k Rose Gold",
    metalOptions: ["Rose Gold", "White Gold", "Yellow Gold"],
    purityOptions: ["14 KT", "18 KT"],
    image: earringImg, gallery: gallery(earringImg),
    description: "Pear-cut lab-grown diamonds suspended from an invisible bail — light as breath, radiant as candlelight.",
    weightGm: 3.20, diamondCt: 1.20,
  },
  {
    id: "drop-02", sku: "TR-EAR-002", name: "Mira Diamond Studs", category: "earrings",
    price: 42500, carats: "0.50 ct total", metal: "18k Rose Gold",
    metalOptions: ["Rose Gold", "White Gold", "Yellow Gold"],
    purityOptions: ["14 KT", "18 KT"],
    image: earringImg, gallery: gallery(earringImg),
    description: "The classic pair. Perfectly matched brilliant-round lab-grown diamonds in a secure four-prong basket.",
    weightGm: 1.80, diamondCt: 0.50,
  },
  {
    id: "drop-03", sku: "TR-EAR-003", name: "Nyra Chandelier Earrings", category: "earrings",
    price: 148000, mrp: 168000, carats: "2.10 ct total", metal: "18k White Gold",
    metalOptions: ["White Gold", "Yellow Gold"],
    purityOptions: ["14 KT", "18 KT"],
    image: earringImg, gallery: gallery(earringImg),
    description: "Cascading tiers of round and marquise lab-grown diamonds — for the evening you'll always remember.",
    weightGm: 6.40, diamondCt: 2.10,
  },
  {
    id: "drop-04", sku: "TR-EAR-004", name: "Suhani Hoop Earrings", category: "earrings",
    price: 78500, carats: "0.90 ct total", metal: "18k Yellow Gold",
    metalOptions: ["Yellow Gold", "Rose Gold", "White Gold"],
    purityOptions: ["14 KT", "18 KT"],
    image: earringImg, gallery: gallery(earringImg),
    description: "Slim diamond-lined hoops that transition from morning to midnight without ever asking to be noticed.",
    weightGm: 4.15, diamondCt: 0.90,
  },
  {
    id: "pen-01", sku: "TR-PEN-001", name: "Luna Solitaire Pendant", category: "pendants",
    price: 38900, carats: "0.30 ct", metal: "18k Rose Gold",
    metalOptions: ["Rose Gold", "White Gold", "Yellow Gold"],
    purityOptions: ["14 KT", "18 KT"],
    image: pendantImg, gallery: gallery(pendantImg),
    description: "A single lab-grown diamond floating from a delicate box-link chain. The first pendant you'll never take off.",
    weightGm: 1.65, diamondCt: 0.30,
  },
  {
    id: "pen-02", sku: "TR-PEN-002", name: "Nova Halo Pendant", category: "pendants",
    price: 54000, mrp: 61800, carats: "0.45 ct", metal: "18k White Gold",
    metalOptions: ["White Gold", "Rose Gold"],
    purityOptions: ["14 KT", "18 KT"],
    image: pendantImg, gallery: gallery(pendantImg),
    description: "A brilliant round centre stone circled by a whisper of pavé — quiet drama on a fine cable chain.",
    weightGm: 2.20, diamondCt: 0.45,
  },
  {
    id: "pen-03", sku: "TR-PEN-003", name: "Amara Heart Pendant", category: "pendants",
    price: 47500, carats: "0.40 ct", metal: "18k Rose Gold",
    metalOptions: ["Rose Gold", "White Gold", "Yellow Gold"],
    purityOptions: ["14 KT", "18 KT"],
    image: pendantImg, gallery: gallery(pendantImg),
    description: "A heart-cut lab-grown diamond in a bezel setting — a modern love letter, worn close.",
    weightGm: 2.00, diamondCt: 0.40,
  },
  {
    id: "brc-01", sku: "TR-BRC-001", name: "Seren Tennis Bracelet", category: "bracelets",
    price: 145000, mrp: 168500, carats: "2.50 ct total", metal: "18k Rose Gold",
    metalOptions: ["Rose Gold", "White Gold", "Yellow Gold"],
    purityOptions: ["14 KT", "18 KT"],
    sizes: ["6.5\"", "7\"", "7.5\""],
    sizeLabel: "Length",
    image: braceletImg, gallery: gallery(braceletImg),
    description: "An unbroken line of matched brilliant lab-grown diamonds — the tennis bracelet, refined for the modern wrist.",
    weightGm: 7.85, diamondCt: 2.50,
  },
  {
    id: "brc-02", sku: "TR-BRC-002", name: "Tria Amora Mangalsutra Bracelet", category: "bracelets",
    price: 84763, mrp: 94730, carats: "1.37 ct", metal: "14k Yellow Gold",
    metalOptions: ["Yellow Gold", "Rose Gold", "White Gold"],
    purityOptions: ["9 KT", "14 KT", "18 KT"],
    sizes: ["6.5\"", "7\"", "7.5\""],
    sizeLabel: "Length",
    image: braceletImg, gallery: gallery(braceletImg),
    description: "A modern mangalsutra bracelet — black beads meet a diamond-set hamsa and heart motif. Auspicious, wearable, yours.",
    weightGm: 3.83, diamondCt: 1.37,
  },
  {
    id: "brc-03", sku: "TR-BRC-003", name: "Eviliora Heart Bracelet", category: "bracelets",
    price: 56717, mrp: 64248, carats: "0.95 ct", metal: "14k Yellow Gold",
    metalOptions: ["Yellow Gold", "Rose Gold", "White Gold"],
    purityOptions: ["9 KT", "14 KT", "18 KT"],
    sizes: ["6.5\"", "7\""],
    sizeLabel: "Length",
    image: braceletImg, gallery: gallery(braceletImg),
    description: "A delicate line bracelet centred on a heart-cut lab-grown diamond flanked by evil-eye motifs.",
    weightGm: 2.90, diamondCt: 0.95,
  },
  {
    id: "brd-01", sku: "TR-BRD-001", name: "Maharani Bridal Set", category: "bridal",
    price: 425000, mrp: 489000, carats: "5.80 ct total", metal: "18k White Gold",
    metalOptions: ["White Gold", "Yellow Gold"],
    purityOptions: ["18 KT"],
    image: bridalImg, gallery: gallery(bridalImg),
    description: "A ceremonial necklace-and-earring set, hand-set with graduated brilliant and marquise lab-grown diamonds. For the woman who is becoming.",
    weightGm: 32.4, diamondCt: 5.80,
  },
  {
    id: "brd-02", sku: "TR-BRD-002", name: "Vivaha Choker Necklace", category: "bridal",
    price: 268000, mrp: 312000, carats: "3.20 ct total", metal: "18k Yellow Gold",
    metalOptions: ["Yellow Gold", "White Gold"],
    purityOptions: ["18 KT"],
    image: bridalImg, gallery: gallery(bridalImg),
    description: "A traditional South-Indian bridal choker reimagined in lab-grown diamonds and yellow gold. Ceremonial. Enduring.",
    weightGm: 21.7, diamondCt: 3.20,
  },
  {
    id: "brd-03", sku: "TR-BRD-003", name: "Anara Bridal Studs", category: "bridal",
    price: 132000, carats: "2.00 ct total", metal: "18k White Gold",
    metalOptions: ["White Gold", "Yellow Gold"],
    purityOptions: ["18 KT"],
    image: bridalImg, gallery: gallery(bridalImg),
    description: "A pair of 1.00ct brilliant lab-grown diamond studs — the heirloom you'll wear on your wedding day and every anniversary after.",
    weightGm: 3.80, diamondCt: 2.00,
  },
];

// Reference gallery images so bundler keeps them
export const editorialImages = { heroImg, bannerImg, educationImg };

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
