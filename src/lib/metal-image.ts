/**
 * Colour-aware product imagery.
 *
 * The POS catalog stores a single `image_url` per product. Shopify file names
 * encode the metal colour as a code segment (e.g. `DLR000257_R1.jpg`,
 * `DER000411_W1_62ca219c-...jpg`). We derive candidate URLs for another colour
 * by swapping that code, then verify in the browser before showing — the swap
 * is a guess (hash-suffixed files often exist only for one colour), never a
 * certainty, so an unverifiable candidate falls back to the original image.
 */

type Metal = "white" | "yellow" | "rose";

const CODE_RE = /_((?:WG|YG|RG|WW|YY|RR|W|Y|R))(\d*)(?=(?:_|\.)|$)/i;

function metalOf(colorName: string): Metal | null {
  const c = colorName.toLowerCase();
  if (c.includes("rose") || c.includes("pink") || c.includes("red")) return "rose";
  if (c.includes("white") || c.includes("platinum") || c.includes("silver")) return "white";
  if (c.includes("yellow") || c.includes("gold")) return "yellow";
  return null;
}

const CODES: Record<Metal, string[]> = {
  white: ["W", "WG", "WW"],
  yellow: ["Y", "YG", "YY"],
  rose: ["R", "RG", "RR"],
};

/**
 * Ordered list of URLs that might hold the given colour's photo.
 * Empty when the filename carries no recognisable colour code.
 */
export function colorCodeCandidates(url: string, colorName: string): string[] {
  if (!url) return [];
  const metal = metalOf(colorName);
  if (!metal) return [];

  const [path, query] = url.split("?");
  const slash = path.lastIndexOf("/");
  const dir = path.slice(0, slash + 1);
  const file = path.slice(slash + 1);

  const m = file.match(CODE_RE);
  if (!m) return [];

  const currentCode = m[1].toUpperCase();
  const digits = m[2] ?? "";
  const start = m.index!;
  const end = start + m[0].length;

  const before = file.slice(0, start);
  const after = file.slice(end); // may include `_<hash>.jpg` or `.jpg`
  const dot = after.indexOf(".");
  const trailing = dot >= 0 ? after.slice(0, dot) : ""; // e.g. `_62ca219c-...`
  const ext = dot >= 0 ? after.slice(dot) : "";

  const q = query ? `?${query}` : "";
  const out: string[] = [];
  const push = (name: string) => {
    const full = `${dir}${name}${q}`;
    if (full !== url && !out.includes(full)) out.push(full);
  };

  for (const code of CODES[metal]) {
    if (code === currentCode && digits) {
      // same code family — nothing to swap
    }
    for (const d of digits ? [digits, ""] : [""]) {
      // keep the original trailing hash first, then the plain form
      if (trailing) push(`${before}_${code}${d}${trailing}${ext}`);
      push(`${before}_${code}${d}${ext}`);
    }
  }
  return out;
}

const cache = new Map<string, string>();

function loads(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 0);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

/**
 * Resolve the best available image for a colour, falling back to `url`.
 * Browser-only; on the server it resolves to `url` immediately.
 */
export async function resolveColorImage(url: string, colorName: string): Promise<string> {
  if (!url || typeof window === "undefined") return url;
  const key = `${url}::${colorName}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const candidates = colorCodeCandidates(url, colorName);
  for (const candidate of candidates) {
    // eslint-disable-next-line no-await-in-loop
    if (await loads(candidate)) {
      cache.set(key, candidate);
      return candidate;
    }
  }
  cache.set(key, url);
  return url;
}
