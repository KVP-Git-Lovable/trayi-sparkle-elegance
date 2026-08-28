// Fix the Sleek Heart Cut Halo Diamond Earrings product description
import { createClient } from "@supabase/supabase-js";

const POS_URL = "https://pdtasnfsdnfttayxibqy.supabase.co";
const POS_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkdGFzbmZzZG5mdHRheXhpYnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MjgwMjYsImV4cCI6MjA5MzAwNDAyNn0.9Lxg9whQzv7eseBabKvBzLaalTWjnZs6hkl4JfLTb-E";

const posSupabase = createClient(POS_URL, POS_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function fixProduct() {
  try {
    // Search for the product
    console.log("Searching for 'Sleek Heart Cut Halo Diamond Earrings'...\n");

    const { data: products, error: fetchError } = await posSupabase
      .from("catalog_products")
      .select("id,handle,title,description")
      .ilike("title", "%sleek heart%")
      .limit(5);

    if (fetchError) {
      console.error("Error fetching products:", fetchError);
      return;
    }

    if (!products || products.length === 0) {
      console.log("No products found matching 'sleek heart'");
      return;
    }

    console.log(`Found ${products.length} product(s):\n`);
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.title}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Handle: ${p.handle}`);
      if (p.description && p.description.includes("ÃƒÆ")) {
        console.log(`   ✓ Contains garbled text`);
      }
      console.log();
    });

    // Find the one with the garbled text
    const targetProduct = products.find(
      (p) =>
        p.description &&
        p.description.includes("ÃƒÆ'Ã†â€™Ãƒâ€ 'Ã¢â‚¬Å¡Ãƒâ€š")
    );

    if (!targetProduct) {
      console.log("No product with the exact garbled text found.");
      console.log("Checking for products with any garbled patterns...\n");
      const anyGarbled = products.filter(
        (p) => p.description && /[ÃƒÆâ€™ƒâ€šÃ‚Â]/.test(p.description)
      );
      if (anyGarbled.length > 0) {
        console.log(`Found ${anyGarbled.length} product(s) with garbled text:`);
        anyGarbled.forEach((p) => {
          console.log(`\n${p.title}`);
          console.log(`Current description (first 300 chars):`);
          console.log(p.description.substring(0, 300));
        });
      }
      return;
    }

    console.log("Found target product:");
    console.log(`Title: ${targetProduct.title}\n`);

    // Show the current description
    console.log("Current description:");
    console.log(targetProduct.description);
    console.log("\n" + "=".repeat(80) + "\n");

    // Remove the garbled text
    const garbledText = "ÃƒÆ'Ã†â€™Ãƒâ€ 'Ã¢â‚¬Å¡Ãƒâ€š";
    const cleanedDescription = targetProduct.description.replace(
      garbledText,
      ""
    );

    console.log("Cleaned description:");
    console.log(cleanedDescription);
    console.log("\n" + "=".repeat(80) + "\n");

    // Update in database
    console.log(`Updating product in database...\n`);

    const { data: updateResult, error: updateError } = await posSupabase
      .from("catalog_products")
      .update({ description: cleanedDescription })
      .eq("id", targetProduct.id);

    if (updateError) {
      console.error("Error updating product:", updateError);
      return;
    }

    console.log("✓ Product description updated successfully!");
    console.log(`\nProduct ID: ${targetProduct.id}`);
    console.log(`Garbled text removed: "${garbledText}"`);
    console.log(`Cleaned description length: ${cleanedDescription.length} chars`);
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

fixProduct();
