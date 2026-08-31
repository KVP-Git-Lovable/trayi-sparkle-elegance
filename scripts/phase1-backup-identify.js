/**
 * Phase 1: Backup & Identify Affected Earrings Products
 *
 * Run with: node scripts/phase1-backup-identify.js
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const POS_URL = "https://pdtasnfsdnfttayxibqy.supabase.co";
const POS_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdGFzbmZzZG5mdHRheXhpYnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MjgwMjYsImV4cCI6MjA5MzAwNDAyNn0.9Lxg9whQzv7eseBabKvBzLaalTWjnZs6hkl4JfLTb-E";

const posSupabase = createClient(POS_URL, POS_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Garbled text patterns to detect
const GARBLED_PATTERNS = [
  /ÃƒÆ'Ã†â€™Ãƒâ€ 'Ã¢â‚¬Å¡Ãƒâ€š/,  // Pattern 1
  /ÃƒÂ€ÃƒÂ¢â‚¬Å¡ÃƒÂ€âœÂ/,           // Pattern 2 (from screenshot)
  /Ãƒâ€šÃ‚Â/,                          // Triple-encoded non-breaking space
  /ÃƒÆ'Ã†â€™/,                        // Complex quotation mark encoding
  /Ã¢â‚¬Å¡/,                           // Low double quotation mark
  /Ã‚Â/,                               // Double-encoded non-breaking space
  /Ãƒâ€š/,                             // Trademark symbol encoding
];

function hasGarbledText(text) {
  if (!text) return false;
  return GARBLED_PATTERNS.some(pattern => pattern.test(text));
}

async function main() {
  console.log("========================================");
  console.log("Phase 1: Backup & Identify Affected Products");
  console.log("========================================\n");

  try {
    // Step 1: Query all earrings products
    console.log("📥 Querying earrings products from POS Supabase...");
    const { data: allEarrings, error: queryError } = await posSupabase
      .from("catalog_products")
      .select("*")
      .ilike("product_type", "%earring%");

    if (queryError) {
      console.error("❌ Error querying products:", queryError);
      process.exit(1);
    }

    console.log(`✅ Found ${allEarrings.length} earrings products\n`);

    // Step 2: Create backup
    const timestamp = new Date().toISOString().split("T")[0];
    const backupDir = path.join(__dirname, "..", "data-backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupFile = path.join(backupDir, `earrings_backup_${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(allEarrings, null, 2));
    console.log(`✅ Backup created: ${backupFile}\n`);

    // Step 3: Identify affected products
    console.log("🔍 Scanning for garbled text...");
    const affected = [];
    const clean = [];

    for (const product of allEarrings) {
      const hasGarbled =
        hasGarbledText(product.title) || hasGarbledText(product.description);

      if (hasGarbled) {
        affected.push({
          id: product.id,
          handle: product.handle,
          title: product.title,
          description_preview: product.description?.substring(0, 150),
          has_garbled: true,
        });
      } else {
        clean.push({
          id: product.id,
          handle: product.handle,
          title: product.title,
        });
      }
    }

    console.log(`✅ Scan complete!\n`);

    // Step 4: Generate reports
    console.log("📊 Results:");
    console.log(`   Total earrings: ${allEarrings.length}`);
    console.log(`   Affected (garbled text): ${affected.length}`);
    console.log(`   Clean (no garbled text): ${clean.length}`);
    console.log(`   Percentage affected: ${((affected.length / allEarrings.length) * 100).toFixed(1)}%\n`);

    // Step 5: Export affected products list
    const affectedFile = path.join(backupDir, `earrings_affected_${affected.length}.json`);
    fs.writeFileSync(affectedFile, JSON.stringify(affected, null, 2));
    console.log(`✅ Affected products exported: ${affectedFile}\n`);

    // Step 6: Export clean products list (for verification)
    const cleanFile = path.join(backupDir, `earrings_clean_${clean.length}.json`);
    fs.writeFileSync(cleanFile, JSON.stringify(clean, null, 2));
    console.log(`✅ Clean products exported: ${cleanFile}\n`);

    // Step 7: Create audit report
    const report = {
      timestamp: new Date().toISOString(),
      total_earrings: allEarrings.length,
      affected_count: affected.length,
      clean_count: clean.length,
      percentage_affected: ((affected.length / allEarrings.length) * 100).toFixed(1),
      backup_file: backupFile,
      affected_file: affectedFile,
      clean_file: cleanFile,
      sample_affected: affected.slice(0, 5),
    };

    const reportFile = path.join(backupDir, "phase1_audit_report.json");
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`✅ Audit report created: ${reportFile}\n`);

    // Step 8: Show samples
    console.log("📋 Sample of affected products (first 5):");
    affected.slice(0, 5).forEach((p, i) => {
      console.log(`\n   ${i + 1}. ${p.title} (${p.handle})`);
      console.log(`      Preview: "${p.description_preview?.substring(0, 100)}..."`);
    });

    console.log("\n========================================");
    console.log("✅ Phase 1 Complete!");
    console.log("========================================");
    console.log(`\nNext steps:`);
    console.log(`1. Review the affected products list (${affected.length} products)`);
    console.log("2. Verify count matches expected ~216");
    console.log("3. Proceed to Phase 2: Generate descriptions");
    console.log("========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  }
}

main();
