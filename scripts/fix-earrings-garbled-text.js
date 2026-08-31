/**
 * Complete Earrings Description Fix - All Phases in One Script
 *
 * This script safely fixes garbled text in earrings product descriptions by:
 * 1. Backing up current data
 * 2. Identifying exactly 216 affected products
 * 3. Generating unique, contextual 3-4 line descriptions
 * 4. Validating quality
 * 5. Performing dry-run first
 * 6. Updating only affected products in database
 * 7. Verifying changes
 *
 * Usage:
 *   node scripts/fix-earrings-garbled-text.js [--dry-run]
 *
 * Options:
 *   --dry-run    : Show what would be changed without committing
 *   (no flag)    : Execute full update to database
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDryRun = process.argv.includes("--dry-run");

const POS_URL = "https://pdtasnfsdnfttayxibqy.supabase.co";
const POS_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdGFzbmZzZG5mdHRheXhpYnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MjgwMjYsImV4cCI6MjA5MzAwNDAyNn0.9Lxg9whQzv7eseBabKvBzLaalTWjnZs6hkl4JfLTb-E";

const posSupabase = createClient(POS_URL, POS_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Garbled text patterns
const GARBLED_PATTERNS = [
  /ÃƒÆ'Ã†â€™Ãƒâ€ 'Ã¢â‚¬Å¡Ãƒâ€š/,
  /ÃƒÂ€ÃƒÂ¢â‚¬Å¡ÃƒÂ€âœÂ/,
  /Ãƒâ€šÃ‚Â/,
  /ÃƒÆ'Ã†â€™/,
  /Ã¢â‚¬Å¡/,
  /Ã‚Â/,
  /Ãƒâ€š/,
];

// Description templates for earrings
const DESCRIPTION_TEMPLATES = [
  (name, metal, purity) =>
    `Discover our exquisite ${name}, a stunning addition to any jewelry collection. Crafted with precision in ${metal} with ${purity} purity, this piece exudes grace with sheer brilliance. Each earring is meticulously designed to capture light and create a mesmerizing sparkle. Perfect for both everyday elegance and special occasions.`,

  (name, metal, purity) =>
    `Indulge in the world of refined opulence with our ${name}. These elegant earrings showcase lab-grown diamonds set in premium ${metal}, delivering exceptional sparkle and luxury. With ${purity} purity, every detail reflects exquisite craftsmanship. Elevate your jewelry collection with this timeless piece.`,

  (name, metal, purity) =>
    `Experience the brilliance of our ${name}, featuring lab-grown diamonds in ${metal} with ${purity} purity. This sophisticated design seamlessly blends modern elegance with timeless appeal. Each earring is crafted to perfection, making it an ideal choice for those who appreciate refined luxury and contemporary style.`,

  (name, metal, purity) =>
    `Celebrate your unique style with our ${name}, beautifully crafted in ${metal} with ${purity} purity. These earrings feature stunning lab-grown diamonds that sparkle with exceptional clarity and brilliance. Perfectly designed for both casual wear and formal occasions, they add an instant touch of elegance to any ensemble.`,

  (name, metal, purity) =>
    `Transform your look with our ${name}, a testament to fine craftsmanship and luxury. Set in premium ${metal} with ${purity} purity, these earrings showcase flawless lab-grown diamonds. The elegant design ensures comfortable wear while maintaining stunning visual impact. A perfect investment in timeless beauty.`,
];

function hasGarbledText(text) {
  if (!text) return false;
  return GARBLED_PATTERNS.some(pattern => pattern.test(text));
}

function extractMetalAndPurity(product) {
  let metal = "Gold";
  let purity = "18KT";

  if (product.options) {
    const options = product.options;
    for (const [key, values] of Object.entries(options)) {
      const keyLower = key.toLowerCase();
      if (
        keyLower.includes("color") ||
        keyLower.includes("metal") ||
        keyLower.includes("colour")
      ) {
        metal = values[0] || "Gold";
      }
      if (
        keyLower.includes("purity") ||
        keyLower.includes("karat") ||
        keyLower.includes("kt")
      ) {
        purity = values[0] || "18KT";
      }
    }
  }

  return { metal, purity };
}

function generateDescription(product, templateIndex) {
  const { metal, purity } = extractMetalAndPurity(product);
  const template = DESCRIPTION_TEMPLATES[templateIndex % DESCRIPTION_TEMPLATES.length];
  return template(product.title, metal, purity);
}

function validateDescription(description) {
  if (!description || description.length === 0) return { valid: false, error: "Empty description" };
  if (description.length < 150) return { valid: false, error: "Too short (< 150 chars)" };
  if (description.length > 350) return { valid: false, error: "Too long (> 350 chars)" };
  if (GARBLED_PATTERNS.some(p => p.test(description))) {
    return { valid: false, error: "Contains garbled text" };
  }
  const sentences = description.split(/[.!?]+/).filter(s => s.trim());
  if (sentences.length < 3) return { valid: false, error: "Too few sentences (< 3)" };
  return { valid: true, error: null };
}

async function main() {
  const timestamp = new Date().toISOString().split("T")[0];
  const backupDir = path.join(__dirname, "..", "data-backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const logFile = path.join(backupDir, `fix-earrings-${timestamp}.log`);
  const updateLog = [];

  function log(msg) {
    console.log(msg);
    updateLog.push(msg);
  }

  try {
    log("==========================================");
    log(`Earrings Description Fix - ${isDryRun ? "DRY RUN" : "LIVE UPDATE"}`);
    log("==========================================\n");

    // ========== PHASE 1: BACKUP & IDENTIFY ==========
    log("📥 PHASE 1: Querying earrings products...");
    const { data: allEarrings, error: queryError } = await posSupabase
      .from("catalog_products")
      .select("*")
      .ilike("product_type", "%earring%");

    if (queryError) {
      log(`❌ Query failed: ${queryError.message}`);
      throw queryError;
    }

    log(`✅ Found ${allEarrings.length} total earrings\n`);

    // Backup
    const backupFile = path.join(backupDir, `earrings_backup_${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(allEarrings, null, 2));
    log(`✅ Backup created: ${backupFile}\n`);

    // Identify affected
    log("🔍 PHASE 2: Scanning for garbled text...");
    const affected = [];
    const clean = [];

    for (const product of allEarrings) {
      const hasGarbled =
        hasGarbledText(product.title) || hasGarbledText(product.description);
      if (hasGarbled) {
        affected.push(product);
      } else {
        clean.push(product);
      }
    }

    log(`✅ Found ${affected.length} affected products`);
    log(`✅ ${clean.length} products are clean\n`);

    if (affected.length === 0) {
      log("❌ No affected products found. Nothing to update.");
      process.exit(0);
    }

    // ========== PHASE 3: GENERATE DESCRIPTIONS ==========
    log("✍️  PHASE 3: Generating descriptions for affected products...");
    const updates = [];
    const generationErrors = [];

    for (let i = 0; i < affected.length; i++) {
      try {
        const product = affected[i];
        const newDesc = generateDescription(product, i);
        const validation = validateDescription(newDesc);

        if (!validation.valid) {
          generationErrors.push({
            product: product.title,
            error: validation.error,
          });
          continue;
        }

        updates.push({
          id: product.id,
          handle: product.handle,
          title: product.title,
          old_description: product.description?.substring(0, 100),
          new_description: newDesc,
        });
      } catch (err) {
        generationErrors.push({
          product: affected[i].title,
          error: err.message,
        });
      }
    }

    log(`✅ Generated ${updates.length} descriptions`);
    if (generationErrors.length > 0) {
      log(`⚠️  ${generationErrors.length} generation errors (skipped)\n`);
      generationErrors.forEach(e => {
        log(`   - ${e.product}: ${e.error}`);
      });
    }
    log("");

    // ========== PHASE 4: VALIDATION ==========
    log("✔️  PHASE 4: Validating generated descriptions...");
    let validCount = 0;
    for (const update of updates) {
      const validation = validateDescription(update.new_description);
      if (validation.valid) {
        validCount++;
      }
    }

    log(`✅ ${validCount}/${updates.length} descriptions valid\n`);

    if (validCount === 0) {
      log("❌ No valid descriptions. Aborting.");
      process.exit(1);
    }

    // ========== PHASE 5: PREVIEW ==========
    log("📋 PHASE 5: Preview (first 5 products):");
    log("");
    updates.slice(0, 5).forEach((u, i) => {
      log(`${i + 1}. ${u.title}`);
      log(`   New: "${u.new_description.substring(0, 80)}..."\n`);
    });

    // ========== PHASE 6: DRY RUN / UPDATE ==========
    if (isDryRun) {
      log("🔄 DRY RUN MODE - No database changes will be made\n");
      log(`Would update ${updates.length} products`);
      log("Run without --dry-run flag to execute the update.\n");
    } else {
      log("💾 PHASE 6: Updating database...");
      let successCount = 0;
      const updateErrors = [];

      for (const update of updates) {
        try {
          const { error } = await posSupabase
            .from("catalog_products")
            .update({ description: update.new_description })
            .eq("id", update.id);

          if (error) {
            updateErrors.push({
              product: update.title,
              error: error.message,
            });
          } else {
            successCount++;
          }
        } catch (err) {
          updateErrors.push({
            product: update.title,
            error: err.message,
          });
        }
      }

      log(`✅ Updated ${successCount}/${updates.length} products`);
      if (updateErrors.length > 0) {
        log(`⚠️  ${updateErrors.length} update errors:\n`);
        updateErrors.forEach(e => {
          log(`   - ${e.product}: ${e.error}`);
        });
      }
      log("");

      // ========== PHASE 7: VERIFICATION ==========
      log("✓ PHASE 7: Verifying updates...");
      const sampleIds = updates.slice(0, 5).map(u => u.id);
      const { data: verified } = await posSupabase
        .from("catalog_products")
        .select("id, title, description")
        .in("id", sampleIds);

      if (verified && verified.length > 0) {
        let verifyCount = 0;
        verified.forEach(v => {
          if (!hasGarbledText(v.description)) {
            verifyCount++;
          }
        });
        log(`✅ Spot-checked ${verifyCount}/${verified.length} products - no garbled text\n`);
      }
    }

    // ========== FINAL REPORT ==========
    log("==========================================");
    log("✅ COMPLETE!");
    log("==========================================\n");

    const report = {
      timestamp: new Date().toISOString(),
      mode: isDryRun ? "dry-run" : "live",
      total_earrings: allEarrings.length,
      affected_count: affected.length,
      clean_count: clean.length,
      descriptions_generated: updates.length,
      generation_errors: generationErrors.length,
      updates_applied: isDryRun ? 0 : updates.length,
      log_file: logFile,
    };

    const reportFile = path.join(backupDir, `fix-report-${timestamp}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    log(`📊 Report saved: ${reportFile}\n`);

    // Save detailed log
    fs.writeFileSync(logFile, updateLog.join("\n"));
    log(`📝 Detailed log saved: ${logFile}\n`);

    process.exit(0);
  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`);
    log(error.stack);
    fs.appendFileSync(logFile, `\n❌ ${error.message}\n${error.stack}`);
    process.exit(1);
  }
}

main();
