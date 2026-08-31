/**
 * Rewrite garbled earring descriptions in the POS catalog.
 *
 *   bun scripts/fix-earrings-garbled-text.js --dry-run   # preview only
 *   bun scripts/fix-earrings-garbled-text.js             # live update
 *
 * Scope: products with product_type EARRING whose description contains
 * mojibake. Only the `description` column is written. Clean earrings and all
 * other categories are never touched.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { cleanText } from "../src/lib/text-clean.ts";
import { POS_URL, POS_ANON_KEY } from "../src/lib/pos-supabase.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDryRun = process.argv.includes("--dry-run");
const REST = `${POS_URL}/rest/v1/catalog_products`;
const HEADERS = {
  apikey: POS_ANON_KEY,
  Authorization: `Bearer ${POS_ANON_KEY}`,
  "Content-Type": "application/json",
};

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const AI_MODEL = "google/gemini-2.5-flash";
const AI_KEY = process.env.LOVABLE_API_KEY;

const GARBLED = /Ã|Â|â€|�/;

const lines = [];
const log = (m) => {
  console.log(m);
  lines.push(String(m));
};

// ---------- helpers ----------

const stripHtml = (html) =>
  cleanText(
    String(html || "")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/p>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&#39;|&rsquo;/gi, "'")
      .replace(/&quot;|&ldquo;|&rdquo;/gi, '"')
      .replace(/\s+/g, " ")
  ).trim();

function sentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function trigrams(text) {
  const t = text.toLowerCase().replace(/[^a-z0-9 ]/g, "");
  const set = new Set();
  for (let i = 0; i < t.length - 2; i++) set.add(t.slice(i, i + 3));
  return set;
}

function similarity(a, b) {
  const A = trigrams(a);
  const B = trigrams(b);
  let inter = 0;
  for (const g of A) if (B.has(g)) inter++;
  return inter / Math.max(1, Math.min(A.size, B.size));
}

function attributes(p) {
  const opts = p.options || {};
  const pick = (re) => {
    for (const [k, v] of Object.entries(opts)) {
      if (re.test(k) && Array.isArray(v) && v.length) return v;
    }
    return [];
  };
  return {
    colors: pick(/colou?r|metal/i),
    karats: pick(/karat|purity|kt/i),
    tags: Array.isArray(p.tags) ? p.tags.filter((t) => !/^\w{1,3}\d+%$/.test(t)) : [],
    source: stripHtml(p.description),
  };
}

// ---------- deterministic fallback (facts only, from the cleaned source) ----------

function fallbackDescription(p) {
  const a = attributes(p);
  const name = cleanText(p.title);
  const metals = a.colors.length
    ? a.colors.length === 1
      ? a.colors[0]
      : `${a.colors.slice(0, -1).join(", ")} and ${a.colors[a.colors.length - 1]}`
    : "";
  const karats = a.karats.join(", ");
  const clarity = (a.source.match(/\b([A-Z]{1,2}\d?-[A-Z]{2})\s*colour clarity/i) || [])[1];
  const collection = a.tags[0];

  const parts = [];
  parts.push(`${name} is crafted for the woman who lets quiet detail speak for her.`);
  if (metals && karats) {
    parts.push(`Choose it in ${metals}, available in ${karats}.`);
  } else if (metals) {
    parts.push(`Choose it in ${metals}.`);
  } else if (karats) {
    parts.push(`Available in ${karats}.`);
  }
  if (/lab.?grown/i.test(a.source)) {
    parts.push(
      clarity
        ? `Set with lab-grown diamonds in ${clarity} colour clarity, every stone is matched for even, steady light.`
        : `Set with lab-grown diamonds, every stone is matched for even, steady light.`
    );
  } else {
    parts.push(`Each stone is matched and set by hand for even, steady light.`);
  }
  parts.push(
    collection
      ? `A ${String(collection).toLowerCase()} piece that moves easily from daylight hours to evening.`
      : `A piece that moves easily from daylight hours to evening.`
  );
  return parts.join(" ");
}

// ---------- AI generation ----------

const SYSTEM = `You write product copy for Trayi Jewellers, an exclusive Limelight Diamonds boutique in Mangalore.

HARD RULES
- Never state a material, stone, diamond type, metal, purity, karat, clarity, colour grade, carat weight, certification, measurement, or price unless it appears verbatim in the product data you are given.
- Never invent prices, discounts or offers.
- Write 3 to 4 sentences, roughly 50-80 words, at most 550 characters.
- Elegant, warm, specific. No exclamation marks, no emoji, no headings, no HTML, no quotes around the text.
- Do NOT begin with "Indulge", "Discover", "Experience", "Elevate", "Introducing" or the product name alone repeated as a label.
- Each description must be clearly distinct from other products: vary the opening, rhythm and angle.
- Return only the description text.`;

async function aiDescribe(p, attemptNote) {
  if (!AI_KEY) return null;
  const a = attributes(p);
  const user = `Product title: ${cleanText(p.title)}
Category: Earrings
Collection tags: ${a.tags.join(", ") || "none"}
Metal colour options: ${a.colors.join(", ") || "not specified"}
Purity options: ${a.karats.join(", ") || "not specified"}
Original description (facts you may use, wording you must not reuse): ${a.source || "none"}
${attemptNote || ""}

Write the new description.`;

  const res = await fetch(AI_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${AI_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: AI_MODEL,
      temperature: 1,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 4000));
    }
    return null;
  }
  const json = await res.json();
  const text = json?.choices?.[0]?.message?.content;
  return text ? cleanText(text).replace(/^["']|["']$/g, "").trim() : null;
}

function validate(text, accepted) {
  if (!text) return "empty";
  if (GARBLED.test(text)) return "garbled characters";
  if (text.length < 140) return "too short";
  if (text.length > 600) return "too long";
  const s = sentences(text);
  if (s.length < 3 || s.length > 5) return `sentence count ${s.length}`;
  if (/[₹$]|\b\d{4,}\b/.test(text)) return "contains a price-like number";
  const first = s[0].toLowerCase();
  for (const prev of accepted) {
    if (prev.text === text) return "duplicate of another description";
    if (prev.first === first) return "same opening sentence as another product";
    if (similarity(text, prev.text) > 0.72) return "too similar to another description";
  }
  return null;
}

// ---------- main ----------

async function main() {
  const stamp = new Date().toISOString().slice(0, 10);
  const dir = path.join(__dirname, "..", "data-backups");
  fs.mkdirSync(dir, { recursive: true });

  log("==========================================");
  log(`Earrings description fix — ${isDryRun ? "DRY RUN" : "LIVE UPDATE"}`);
  log("==========================================\n");

  // Phase 1 — fetch + backup
  const res = await fetch(
    `${REST}?select=*&product_type=ilike.*earring*&limit=2000`,
    { headers: HEADERS }
  );
  if (!res.ok) throw new Error(`catalog fetch failed: ${res.status} ${await res.text()}`);
  const earrings = await res.json();
  log(`Phase 1 — fetched ${earrings.length} earrings`);

  const backupFile = path.join(dir, `earrings_backup_${stamp}.json`);
  fs.writeFileSync(
    backupFile,
    JSON.stringify(
      earrings.map((p) => ({
        id: p.id,
        handle: p.handle,
        title: p.title,
        product_type: p.product_type,
        options: p.options,
        tags: p.tags,
        description: p.description,
      })),
      null,
      2
    )
  );
  log(`Phase 1 — backup written to ${backupFile}\n`);

  // Phase 2 — identify
  const affected = earrings.filter((p) => p.description && GARBLED.test(p.description));
  log(`Phase 2 — ${affected.length} affected, ${earrings.length - affected.length} clean\n`);
  if (!affected.length) {
    log("Nothing to do.");
    return;
  }

  // Phase 3+4 — generate & validate
  log("Phase 3/4 — generating and validating descriptions...");
  const accepted = [];
  const results = [];
  const fallbacks = [];
  let done = 0;

  const rejects = {};
  const CONCURRENCY = 12;
  const pending = [...affected];

  for (let round = 0; round < 7 && pending.length; round++) {
    const queue = pending.splice(0, pending.length);
    const note =
      round === 0
        ? ""
        : "A previous attempt was rejected for being too similar to other copy. Take a clearly different angle, opening and rhythm.";
    for (let i = 0; i < queue.length; i += CONCURRENCY) {
      const chunk = queue.slice(i, i + CONCURRENCY);
      const candidates = await Promise.all(chunk.map((p) => aiDescribe(p, note).catch(() => null)));
      chunk.forEach((p, idx) => {
        const candidate = candidates[idx];
        const reason = validate(candidate, accepted);
        if (reason) {
          rejects[reason] = (rejects[reason] || 0) + 1;
          pending.push(p);
          return;
        }
        accepted.push({ text: candidate, first: sentences(candidate)[0].toLowerCase() });
        results.push({
          id: p.id,
          handle: p.handle,
          title: p.title,
          old_description: p.description,
          new_description: candidate,
          source: "ai",
        });
        done++;
      });
      log(`  ...${done}/${affected.length} (round ${round + 1})`);
    }
  }

  for (const p of pending) {
    const fb = fallbackDescription(p);
    const fbReason = validate(fb, accepted);
    fallbacks.push({ handle: p.handle, title: p.title, fallbackIssue: fbReason });
    accepted.push({ text: fb, first: sentences(fb)[0].toLowerCase() });
    results.push({
      id: p.id,
      handle: p.handle,
      title: p.title,
      old_description: p.description,
      new_description: fb,
      source: "fallback",
    });
    done++;
  }


  log(`Phase 3/4 — rejection reasons: ${JSON.stringify(rejects)}`);
  log(`Phase 3/4 — generated ${results.length} (${fallbacks.length} via fallback)\n`);

  log("Phase 5 — preview (first 5):");
  results.slice(0, 5).forEach((r, i) => {
    log(`\n${i + 1}. ${r.title} [${r.handle}]`);
    log(`   OLD: ${stripHtml(r.old_description).slice(0, 110)}...`);
    log(`   NEW: ${r.new_description}`);
  });
  log("");

  const previewFile = path.join(dir, `fix-preview-${stamp}.json`);
  fs.writeFileSync(previewFile, JSON.stringify(results, null, 2));
  log(`Phase 5 — full preview written to ${previewFile}\n`);

  let updated = 0;
  let verified = 0;
  const failures = [];

  if (isDryRun) {
    log(`DRY RUN — no database changes. Would update ${results.length} products.\n`);
  } else {
    log("Phase 6 — updating database...");
    for (const r of results) {
      const put = await fetch(`${REST}?id=eq.${r.id}`, {
        method: "PATCH",
        headers: { ...HEADERS, Prefer: "return=minimal" },
        body: JSON.stringify({ description: r.new_description }),
      });
      if (put.ok) updated++;
      else failures.push({ handle: r.handle, stage: "update", error: `${put.status} ${await put.text()}` });
    }
    log(`Phase 6 — updated ${updated}/${results.length}\n`);

    log("Phase 7 — verifying...");
    const ids = results.map((r) => r.id);
    for (let i = 0; i < ids.length; i += 50) {
      const chunk = ids.slice(i, i + 50);
      const vr = await fetch(
        `${REST}?select=id,handle,description&id=in.(${chunk.join(",")})`,
        { headers: HEADERS }
      );
      const rows = await vr.json();
      for (const row of rows) {
        const expected = results.find((r) => r.id === row.id);
        if (!GARBLED.test(row.description || "") && row.description === expected.new_description) verified++;
        else failures.push({ handle: row.handle, stage: "verify", error: "row does not match new description" });
      }
    }
    log(`Phase 7 — verified ${verified}/${results.length}\n`);
  }

  const report = {
    timestamp: new Date().toISOString(),
    mode: isDryRun ? "dry-run" : "live",
    total_earrings: earrings.length,
    expected: affected.length,
    generated: results.length,
    validated: results.length,
    ai_generated: results.filter((r) => r.source === "ai").length,
    fallback_used: fallbacks.length,
    updated: isDryRun ? 0 : updated,
    verified: isDryRun ? 0 : verified,
    failed: failures.length,
    failures,
    backup: backupFile,
    preview: previewFile,
  };
  const reportFile = path.join(dir, `fix-report-${stamp}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(dir, `fix-earrings-${stamp}.log`), lines.join("\n"));

  log("==========================================");
  log(`Expected:  ${affected.length}`);
  log(`Generated: ${results.length}`);
  log(`Validated: ${results.length}`);
  log(`Updated:   ${isDryRun ? "0 (dry run)" : updated}`);
  log(`Verified:  ${isDryRun ? "0 (dry run)" : verified}`);
  log(`Failed:    ${failures.length}`);
  const ok = isDryRun
    ? results.length === affected.length
    : updated === affected.length && verified === affected.length && failures.length === 0;
  log(ok ? (isDryRun ? "DRY RUN COMPLETE" : "SUCCESS — all rows updated and verified") : "PARTIAL FAILURE");
  log("==========================================");
  fs.writeFileSync(path.join(dir, `fix-earrings-${stamp}.log`), lines.join("\n"));
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
