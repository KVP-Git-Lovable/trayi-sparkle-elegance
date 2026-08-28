/**
 * Repairs mojibake in catalog copy: text that was UTF-8 encoded and then
 * re-read as Windows-1252, sometimes two or three times over
 * (e.g. a non-breaking space becoming `Â`, then `Ã‚Â`, then `Ãƒâ€šÃ‚Â`).
 *
 * Display-only helper — the source data is never modified.
 */

// Windows-1252 code points for bytes 0x80–0x9F (others map 1:1 to Latin-1).
const CP1252_HIGH: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
};

const decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8", { fatal: true }) : null;

/** One round of "interpret these characters as cp1252 bytes, decode as UTF-8". */
function decodeOnce(input: string): string | null {
  if (!decoder) return null;
  const bytes = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const cp = input.codePointAt(i)!;
    if (cp > 0xffff) return null;
    const byte = CP1252_HIGH[cp] ?? cp;
    if (byte > 0xff) return null;
    bytes[i] = byte;
  }
  try {
    return decoder.decode(bytes);
  } catch {
    return null;
  }
}

function repairRun(run: string): string {
  let current = run;
  for (let i = 0; i < 8; i++) {
    const next = decodeOnce(current);
    if (next === null || next === current) break;
    current = next;
  }
  return current;
}

export function cleanText(input: string | null | undefined): string {
  if (!input) return "";

  // Repair each run of non-ASCII characters independently so a single
  // undecodable fragment doesn't block the rest of the string.
  let out = input.replace(/[^\x00-\x7F]+/g, (run) => repairRun(run));

  // Leftover artefacts from mangled non-breaking spaces that lost their tail.
  out = out.replace(/Ãƒâ€šÃ‚Â|Ã‚Â|Ã‚|Â(?=[\s<]|$)/g, "");

  // Real non-breaking spaces / stray replacement chars → plain spaces.
  out = out.replace(/[\u00a0\u202f\ufeff]/g, " ").replace(/\ufffd/g, "");

  return out.replace(/[ \t]{2,}/g, " ").trim();
}
