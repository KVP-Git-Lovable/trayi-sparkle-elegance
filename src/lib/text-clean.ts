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

// Reverse mapping: Unicode code points that represent CP1252 mojibake.
// When these "wrong" characters appear in a mojibake sequence, map them back to their CP1252 byte values.
const CP1252_REVERSE: Record<number, number> = (() => {
  const map: Record<number, number> = {};
  // Characters in U+0080-U+009F range are the "mojibake zone"
  map[0x0080] = 0x80; map[0x0081] = 0x81; map[0x0082] = 0x82; map[0x0083] = 0x83;
  map[0x0084] = 0x84; map[0x0085] = 0x85; map[0x0086] = 0x86; map[0x0087] = 0x87;
  map[0x0088] = 0x88; map[0x0089] = 0x89; map[0x008a] = 0x8a; map[0x008b] = 0x8b;
  map[0x008c] = 0x8c; map[0x008d] = 0x8d; map[0x008e] = 0x8e; map[0x008f] = 0x8f;
  map[0x0090] = 0x90; map[0x0091] = 0x91; map[0x0092] = 0x92; map[0x0093] = 0x93;
  map[0x0094] = 0x94; map[0x0095] = 0x95; map[0x0096] = 0x96; map[0x0097] = 0x97;
  map[0x0098] = 0x98; map[0x0099] = 0x99; map[0x009a] = 0x9a; map[0x009b] = 0x9b;
  map[0x009c] = 0x9c; map[0x009d] = 0x9d; map[0x009e] = 0x9e; map[0x009f] = 0x9f;
  return map;
})();

const decoder = typeof TextDecoder !== "undefined" ? new TextDecoder("utf-8", { fatal: true }) : null;

/** One round of "interpret these characters as cp1252 bytes, decode as UTF-8". */
function decodeOnce(input: string): string | null {
  if (!decoder) return null;

  const bytes = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const cp = input.codePointAt(i)!;
    if (cp > 0xffff) return null;

    let byte: number;
    // Try forward mapping (Unicode code points that should map to CP1252 bytes)
    if (CP1252_HIGH[cp] !== undefined) {
      byte = CP1252_HIGH[cp];
    }
    // Try reverse mapping (mojibake zone: "wrong" characters that are actually CP1252 bytes)
    else if (CP1252_REVERSE[cp] !== undefined) {
      byte = CP1252_REVERSE[cp];
    }
    // ASCII (0x00-0x7F)
    else if (cp <= 0x7f) {
      byte = cp;
    }
    // Latin-1 compatible (0xA0-0xFF): use as CP1252 byte value
    else if (cp >= 0xa0 && cp <= 0xff) {
      byte = cp;
    }
    // Everything else is unmappable
    else {
      return null;
    }

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

  // Remove leftover mojibake patterns that couldn't be fully decoded.
  // Pattern 1: Byte sequences in C0-C7 range (common mojibake markers)
  out = out.replace(/[\xC0-\xC7](?:[\x80-\xBF]|[\xC0-\xC7])/g, "");

  // Pattern 2: Multiple consecutive Latin-1 extended chars
  out = out.replace(/[\xC0-\xC7]{2,}|[\xE0-\xE7]{2,}/g, "");

  // Pattern 3: Specific known mojibake patterns
  out = out.replace(/Â(?=[\s<]|$)/g, "");

  // Real non-breaking spaces / stray replacement chars → plain spaces.
  out = out.replace(/[  ﻿]/g, " ").replace(/�/g, "");

  return out.replace(/[ \t]{2,}/g, " ").trim();
}
